export const PRODUCTS = [
  {
    id: 'com.halfdestiny.vip.monthly',
    key: 'vip_monthly',
    title: 'Monthly VIP Membership',
    title_zh: '月会员',
    type: 'subscription',
    cycle: 'monthly',
    cny_price: 129,
    usd_display_price: '$19.99'
  },
  {
    id: 'com.halfdestiny.vip.yearly',
    key: 'vip_yearly',
    title: 'Yearly VIP Membership',
    title_zh: '年会员',
    type: 'subscription',
    cycle: 'yearly',
    cny_price: 599,
    usd_display_price: '$89.99'
  },
  {
    id: 'com.halfdestiny.report.soul-analysis',
    key: 'soul_analysis_report',
    title: 'Advanced Soul Resonance Analysis',
    title_zh: '单次灵魂共振高阶解析',
    type: 'consumable',
    cycle: 'one_time',
    cny_price: 9.9,
    usd_display_price: '$1.99'
  },
  {
    id: 'com.halfdestiny.report.compatibility',
    key: 'compatibility',
    title: 'Soul Compatibility Report',
    title_zh: '单次灵魂合盘',
    type: 'consumable',
    cycle: 'one_time',
    cny_price: 19.9,
    usd_display_price: '$2.99'
  },
  {
    id: 'com.halfdestiny.report.dayun',
    key: 'dayun_report',
    title: 'Dayun Premium Report',
    title_zh: '单次大运付费',
    type: 'consumable',
    cycle: 'one_time',
    cny_price: 9.9,
    usd_display_price: '$1.99'
  },
  {
    id: 'com.halfdestiny.report.liunian',
    key: 'liunian_report',
    title: 'Annual Fortune Analysis',
    title_zh: '单次流年分析',
    type: 'consumable',
    cycle: 'one_time',
    cny_price: 9.9,
    usd_display_price: '$1.99'
  }
] as const;
