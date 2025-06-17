// MailCharts email campaign service (to be implemented with MailCharts API or Gmail scraping)
export async function getMailChartsCampaigns(domain: string) {
  // TODO: Implement real MailCharts API integration
  return [
    { subject: 'Welcome to our newsletter!', sent: '2024-06-01', preview: 'Thanks for joining...', domain }
  ];
} 