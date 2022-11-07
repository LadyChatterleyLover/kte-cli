function toLowerCase(value) {
  return value.slice(0, 1).toLowerCase() + value.slice(1)
}

function toUpperCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1)
}

module.exports = {
  toLowerCase,
  toUpperCase,
}
