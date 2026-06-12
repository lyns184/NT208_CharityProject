const reportService = require('./report.service')

class ReportController {
  async getCampaignStatementPdf(req, res, next) {
    try {
      const { buffer, campaign } = await reportService.createStatementPdf(req.params.id)
      const fileName = `bang-chi-tiet-giao-dich-${campaign.displayId || campaign._id}.pdf`

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
      res.setHeader('Content-Length', buffer.length)
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ReportController()
