const Campaign = require('../campaign/Campaign.model')
const Donation = require('../payment/Donation.model')
const Disbursement = require('../disbursement/Disbursement.model')
const AppError = require('../../utils/AppError')
const buildStatementHtml = require('./templates/statement.template')

const PRIVATE_CAMPAIGN_STATUSES = new Set(['PENDING', 'REJECTED'])

class ReportService {
  getSystemAccount() {
    return {
      name: process.env.SEPAY_ACCOUNT_NAME || 'OpenHeart',
      number: process.env.SEPAY_ACCOUNT_NO || '0123456789',
      bank: process.env.SEPAY_BANK_CODE || 'MB',
    }
  }

  async getStatementData(campaignId) {
    const campaign = await Campaign.findById(campaignId)
      .populate('creatorId', 'name avatar accountType isVerified')
      .lean()

    if (!campaign || PRIVATE_CAMPAIGN_STATUSES.has(campaign.status)) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND')
    }

    const [donations, disbursements] = await Promise.all([
      Donation.find({
        campaignId: campaign._id,
        paymentStatus: 'SUCCESS',
      })
        .populate('donorId', 'name avatar')
        .sort({ createdAt: -1 })
        .lean(),
      Disbursement.find({
        campaignId: campaign._id,
        status: 'COMPLETED',
      })
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean(),
    ])

    const totalIn = donations.reduce(
      (sum, item) => sum + Number(item.paidAmount || item.amount || 0),
      0
    )
    const totalOut = disbursements.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )

    return {
      campaign,
      owner: campaign.creatorId || null,
      account: this.getSystemAccount(),
      generatedAt: new Date(),
      summary: {
        totalIn,
        totalOut,
        remainingBalance: Math.max(totalIn - totalOut, 0),
        donationCount: donations.length,
        disbursementCount: disbursements.length,
      },
      donations,
      disbursements,
    }
  }

  async createStatementPdf(campaignId) {
    const data = await this.getStatementData(campaignId)
    const html = buildStatementHtml(data)

    let puppeteer
    try {
      puppeteer = require('puppeteer')
    } catch (error) {
      throw new AppError('Puppeteer is not installed in backend', 500, 'INTERNAL_ERROR')
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '10mm',
          bottom: '12mm',
          left: '10mm',
        },
      })

      return {
        buffer,
        campaign: data.campaign,
      }
    } finally {
      await browser.close()
    }
  }
}

module.exports = new ReportService()
