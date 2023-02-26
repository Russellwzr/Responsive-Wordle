const fill = d3.scale.category20()

// draw wordle with fontSize scale
function drawWithScale(words, w, h) {
  document.getElementById('vis').innerHTML = ''

  let rate = w * h,
    j = 0

  const svg = d3.select('#vis').append('svg').attr('width', w).attr('height', h)

  svg
    .append('g')
    .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')')
    .selectAll('text')
    .data(words)
    .enter()
    .append('text')
    .attr('x', (d) => d.x0 - w / 2)
    .attr('y', (d) => d.y0 - h / 2)
    .attr('id', (d) => 'id' + ++j)
    .style('font-size', function (d) {
      return ~~(Math.sqrt((d.size * rate) / 2) - 1) + 'px'
    })
    .style('font-family', (d) => d.font)
    .style('fill', (d, i) => fill(i))
    .attr('text-anchor', 'middle')
    .attr('transform', (d) => 'rotate(' + d.rotate + ')')
    .text((d) => d.text)

  let n = words.length
  // adjust the fontSize to ensure that the word is within the bounding box
  for (let i = 1; i <= n; i++) {
    let curId = '#id' + i,
      curFontSize = ~~(Math.sqrt((words[i - 1].size * rate) / 2) - 1)

    words[i - 1].finalSize = curFontSize

    let groupElement = document.getElementById('id' + i)
    let bboxGroup = groupElement.getBBox()

    let curX = words[i - 1].centerX * w,
      curY = words[i - 1].centerY * h

    let curWidth = bboxGroup.width,
      curHeight = bboxGroup.height,
      boundingWidth = words[i - 1].rateWidth * w,
      boundingHeight = words[i - 1].rateHeight * h

    if (
      (boundingWidth < boundingHeight && words[i - 1].rotate == 0) ||
      (boundingWidth > boundingHeight && words[i - 1].rotate == 90)
    ) {
      let tmp = curWidth
      curWidth = curHeight
      curHeight = tmp
      words[i - 1].rotate = 90 - words[i - 1].rotate
    }

    let fontBounding = {}
    let boxBounding = {}

    fontBounding.x0 = curX - curWidth / 2
    fontBounding.y0 = curY + curHeight / 2
    fontBounding.x1 = curX + curWidth / 2
    fontBounding.y1 = curY - curHeight / 2

    boxBounding.x0 = curX - boundingWidth / 2
    boxBounding.y0 = curY + boundingHeight / 2
    boxBounding.x1 = curX + boundingWidth / 2
    boxBounding.y1 = curY - boundingHeight / 2

    let p = d3.select('body').select('svg').select('g').select(curId)

    while (
      !(
        fontBounding.x0 >= boxBounding.x0 &&
        fontBounding.y0 <= boxBounding.y0 &&
        fontBounding.x1 <= boxBounding.x1 &&
        fontBounding.y1 >= boxBounding.y1
      )
    ) {
      curFontSize--
      if (curFontSize <= 0) {
        break
      }

      // horizontal direction
      if (words[i - 1].rotate == 0) {
        p.attr('transform', 'translate(' + [curX, fontBounding.y0] + ')rotate(' + words[i - 1].rotate + ')').style(
          'font-size',
          curFontSize + 'px',
        )
      }
      // vertically direction
      else {
        p.attr('transform', 'translate(' + [fontBounding.x0, curY] + ')rotate(' + words[i - 1].rotate + ')').style(
          'font-size',
          curFontSize + 'px',
        )
      }

      groupElement = document.getElementById('id' + i)
      bboxGroup = groupElement.getBoundingClientRect()
      curWidth = bboxGroup.width
      curHeight = bboxGroup.height
      fontBounding.x0 = curX - curWidth / 2
      fontBounding.y0 = curY + curHeight / 2
      fontBounding.x1 = curX + curWidth / 2
      fontBounding.y1 = curY - curHeight / 2
    }

    // horizontal direction
    if (words[i - 1].rotate == 0) {
      p.attr(
        'transform',
        'translate(' + [curX, fontBounding.y0 - curHeight / 5] + ')rotate(' + words[i - 1].rotate + ')',
      ).style('font-size', curFontSize + 'px')
      words[i - 1].finalSize = curFontSize
    }
    // vertically direction
    else {
      p.attr(
        'transform',
        'translate(' + [fontBounding.x0 + curWidth / 5, curY] + ')rotate(' + words[i - 1].rotate + ')',
      ).style('font-size', curFontSize + 'px')
      words[i - 1].finalSize = curFontSize
    }
  }

  // delete words whose fontSize is too small
  words = words.filter((item) => item.finalSize > 15)

  return words
}

// draw wordle without fontSize scale
function drawWithoutScale(words, w, h) {
  document.getElementById('vis').innerHTML = ''

  let j = 0

  d3.select('#vis')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .append('g')
    .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')')
    .selectAll('text')
    .data(words)
    .enter()
    .append('text')
    .attr('id', (d) => 'id' + ++j)
    .style('font-size', (d) => d.finalSize + 'px')
    .style('font-family', (d) => d.font)
    .style('fill', (d, i) => fill(i))
    .attr('text-anchor', 'middle')
    .attr('transform', (d) => 'translate(' + [d.x * w, d.y * h] + ')rotate(' + d.rotate + ')')
    .text((d) => d.text)
}

function startUpdateTransition(words, w, h) {
  for (let i = 0; i < words.length; i++) {
    const word = d3.select('#id' + (i + 1))
    const endtransform = 'translate(' + [words[i].x * w, words[i].y * h] + ')rotate(' + words[i].rotate + ')'
    word.transition().duration(60).attr('transform', endtransform)
  }
}
