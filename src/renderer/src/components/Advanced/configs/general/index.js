export default () => {
  return [
    {
      label: '切换语言',
      type: 'select',
      field: 'lang',
      value: '',
      placeholder: 'Default as English',
      options: [
        { label: '中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
      ],
    },
  ]
}
