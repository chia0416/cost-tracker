const tools = {
  getToday: () => {
    const n = new Date()
    const y = n.getFullYear();
    const m = n.getMonth() + 1;
    const d = n.getDate();
    let date = ''
    if (m > 10) {
      date = y + '-' + m + '-' + d
    } else {
      if (d > 10) {
        date = y + '-0' + m + '-' + d
      } else {
        date = y + '-0' + m + '-0' + d
      }

    }
    return date
  },
}

module.exports = tools