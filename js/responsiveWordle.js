const responsiveWordle = function () {
  var size = [256, 256],
    text = cloudText,
    font = cloudFont,
    fontSize = cloudFontSize,
    fontStyle = cloudFontNormal,
    fontWeight = cloudFontNormal,
    rotate = cloudRotate,
    words = [],
    cloud = {}

  cloud.start = function () {
    var tags = [],
      data = words
        .map(function (d, i) {
          d.text = text.call(this, d, i)
          d.font = font.call(this, d, i)
          d.style = fontStyle.call(this, d, i)
          d.weight = fontWeight.call(this, d, i)
          d.rotate = rotate.call(this, d, i)
          d.size = ~~fontSize.call(this, d, i)
          d.width = words.width
          d.height = words.height
          return d
        })
        .sort(function (a, b) {
          return b.size - a.size
        })

    let n = data.length
    let total_num = 0

    for (let i = 0; i < n; i++) {
      total_num += data[i].size
    }

    for (let i = 0; i < n; i++) {
      data[i].size = data[i].size / total_num
    }

    weightWordBox(data, size)
    allWordSpiral(data, size, tags)

    return tags
  }

  cloud.words = function (_) {
    return arguments.length ? ((words = _), cloud) : words
  }

  cloud.size = function (_) {
    return arguments.length ? ((size = [+_[0], +_[1]]), cloud) : size
  }

  cloud.font = function (_) {
    return arguments.length ? ((font = functor(_)), cloud) : font
  }

  cloud.fontStyle = function (_) {
    return arguments.length ? ((fontStyle = functor(_)), cloud) : fontStyle
  }

  cloud.fontWeight = function (_) {
    return arguments.length ? ((fontWeight = functor(_)), cloud) : fontWeight
  }

  cloud.rotate = function (_) {
    return arguments.length ? ((rotate = functor(_)), cloud) : rotate
  }

  cloud.text = function (_) {
    return arguments.length ? ((text = functor(_)), cloud) : text
  }

  cloud.fontSize = function (_) {
    return arguments.length ? ((fontSize = functor(_)), cloud) : fontSize
  }

  return cloud
}

function weightWordBox(data, size) {
  var i = -1,
    n = data.length

  var rectArea = size[0] * size[1]

  d3.select('#vis')
    .append('svg')
    .attr('width', size[0])
    .attr('height', size[1])
    .append('g')
    .attr('transform', 'translate(' + size[0] / 2 + ',' + size[1] / 2 + ')')
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .style('font-size', function (d) {
      return ~~(Math.sqrt((d.size * rectArea * 0.8) / 2) - 1) * 0.5 + 'px'
    })
    .style('font-family', 'Impact')
    .attr('text-anchor', 'middle')
    .attr('transform', function (d) {
      return 'translate(' + [size[0] / 2, size[1] / 2] + ')rotate(' + d.rotate + ')'
    })
    .text(function (d) {
      return d.text
    })

  var groupElement = document.querySelectorAll('text')

  while (++i < n) {
    var bboxGroup = groupElement[i].getBoundingClientRect()
    data[i].width = bboxGroup.width
    data[i].height = bboxGroup.height
  }

  var obj = document.getElementById('vis')
  obj.innerHTML = ''
}

// collision detection in word level.
function isWordOverlap(wordA, wordB, ir = true) {
  if (wordA === wordB) {
    return false
  }

  const Ax = wordA.x0 + wordA.width
  const Ay = wordA.y0 - wordA.height
  const Bx = wordB.x0 + wordB.width
  const By = wordB.y0 - wordB.height

  let res

  res = Ax > wordB.x0 && Bx > wordA.x0 && wordA.y0 > By && wordB.y0 > Ay

  if (ir) {
    res = isWordOverlap(wordB, wordA, false)
  }

  return res
}

// collision detection in wordle level.
function isWordOverlapAll(CurWord, tags) {
  let n = tags.length
  if (n == 0) {
    return false
  }
  for (let i = 0; i < n; i++) {
    if (isWordOverlap(CurWord, tags[i])) {
      return true
    }
  }
  return false
}

// spiral-based wordle layout algorithm
function allWordSpiral(words, size, tags) {
  const increase = 0.5

  for (let i = 0; i < words.length; i++) {
    let r = 2
    let degree = 0

    // start position
    let x = size[0] / 2
    let y = size[1] / 2

    // lower left corner position of word[i]
    words[i].x0 = r * Math.cos((degree * Math.PI) / 180) + x - words[i].width / 2
    words[i].y0 = r * Math.sin((degree * Math.PI) / 180) + y + words[i].height / 2

    degree += increase

    let finishFlag = true

    // collision detection
    while (isWordOverlapAll(words[i], tags)) {
      words[i].x0 = r * Math.cos((degree * Math.PI) / 180) + x - words[i].width / 2
      words[i].y0 = r * Math.sin((degree * Math.PI) / 180) + y + words[i].height / 2

      if (
        words[i].x0 < 0 ||
        words[i].y0 > 2 * y ||
        words[i].x0 + words[i].width > 2 * x ||
        words[i].y0 - words[i].height < 0
      ) {
        finishFlag = false
        break
      }

      degree += increase
      r = r + 0.01
    }

    if (finishFlag) {
      let xx, yy
      if (!words[i].rotate) {
        xx = words[i].x0 + words[i].width / 2 - x
        yy = words[i].y0 - words[i].height / 5 - y
      } else {
        xx = words[i].x0 + words[i].width / 5 - x
        yy = words[i].y0 - words[i].height / 2 - y
      }
      words[i].x = xx / size[0]
      words[i].y = yy / size[1]
      words[i].centerX = (words[i].x0 + words[i].width / 2 - x) / size[0]
      words[i].centerY = (words[i].y0 - words[i].height / 2 - y) / size[1]
      words[i].leftUpX = (words[i].x0 - x) / size[0]
      words[i].leftUpY = (words[i].y0 - words[i].height - y) / size[1]
      words[i].rateWidth = words[i].width / size[0]
      words[i].rateHeight = words[i].height / size[1]
      tags.push(words[i])
    }
  }
}

function cloudText(d) {
  return d.text
}

function cloudFont() {
  return 'serif'
}

function cloudFontNormal() {
  return 'normal'
}

function cloudFontSize(d) {
  return Math.sqrt(d.value)
}

function cloudRotate() {
  return (~~(Math.random() * 6) - 3) * 30
}

function functor(d) {
  return typeof d === 'function'
    ? d
    : function () {
        return d
      }
}
