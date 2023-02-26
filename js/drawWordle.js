const fill = d3.scale.category20()

// draw wordle with fontSize scale
function scaleWordBox(words, w, h) {
  drawWordle(words, w, h, true)

  // adjust the fontSize to ensure that the word is within the bounding box
  for (let i = 0; i < words.length; i++) {
    const textElement = document.getElementById(`id-${i + 1}`)
    const bboxGroup = textElement.getBBox()

    const transformAttr = textElement.getAttribute('transform')
    const isRotate = parseInt(transformAttr.match(/rotate\((.*?)\)/)[1]) === 90 ? true : false
    let textWidth = isRotate ? bboxGroup.height : bboxGroup.width,
      textHeight = isRotate ? bboxGroup.width : bboxGroup.height,
      boundingWidth = words[i].rateWidth * w,
      boundingHeight = words[i].rateHeight * h

    // adaptive rotation
    if (
      (boundingWidth < boundingHeight && words[i].rotate == 0) ||
      (boundingWidth > boundingHeight && words[i].rotate == 90)
    ) {
      const swapVal = textWidth
      textWidth = textHeight
      textHeight = swapVal
      words[i].rotate = 90 - words[i].rotate
    }

    const ratio = Math.min(boundingHeight / textHeight, boundingWidth / textWidth, 1)
    const fontSize = parseInt(window.getComputedStyle(textElement).getPropertyValue('font-size')) * ratio
    words[i].fontSize = fontSize

    d3.select(`#id-${i + 1}`)
      .style('font-size', `${fontSize}`)
      .attr('transform', `rotate(${words[i].rotate})`)
  }

  // delete words whose fontSize is too small
  words = words.filter((item) => item.fontSize > 18)

  // re-scale boundingbox to reduce white space
  for (let i = 0; i < words.length; i++) {
    const textElement = document.getElementById(`id-${i + 1}`)
    const bboxGroup = textElement.getBBox()
    const transformAttr = textElement.getAttribute('transform')
    const isRotate = parseInt(transformAttr.match(/rotate\((.*?)\)/)[1]) === 90 ? true : false
    let textWidth = isRotate ? bboxGroup.height : bboxGroup.width,
      textHeight = isRotate ? bboxGroup.width : bboxGroup.height
    words[i].rateWidth = textWidth / w
    words[i].rateHeight = textHeight / h
  }

  return words
}

// draw wordle without fontSize scale
function drawWordle(words, w, h, isScale) {
  document.getElementById('vis').innerHTML = ''

  let i = 0,
    j = 0

  const svg = d3.select('#vis').append('svg').attr('width', w).attr('height', h)

  svg
    .append('g')
    .attr('id', 'outer-container')
    .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')')

  svg
    .select('#outer-container')
    .selectAll('g')
    .data(words)
    .enter()
    .append('g')
    .attr('id', (d) => `inner-container-${++i}`)
    .attr('transform', (d) => `translate(${d.centerX * w}, ${d.centerY * h})`)
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('id', (d) => `id-${++j}`)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .style('font-size', (d) => {
      return isScale ? ~~(Math.sqrt((d.size * w * h) / 2) - 1) : d.fontSize
    })
    .style('font-family', (d) => d.font)
    .style('fill', (d, i) => fill(i))
    .attr('transform', (d) => 'rotate(' + d.rotate + ')')
    .text((d) => d.text)

  /*   
  
  // for debug (draw real bounding box)

  let k = 0
  svg
    .select('#outer-container')
    .selectAll('rect')
    .data(words)
    .enter()
    .append('rect')
    .attr('id', (d) => `rect-${++k}`)
    .attr('x', (d) => d.centerX * w - (d.rateWidth * w) / 2)
    .attr('y', (d) => d.centerY * h - (d.rateHeight * h) / 2)
    .attr('width', (d) => d.rateWidth * w)
    .attr('height', (d) => d.rateHeight * h)
    .attr('fill', 'transparent')
    .attr('stroke', 'red') */
}

function startUpdateTransition(words, w, h) {
  for (let i = 0; i < words.length; i++) {
    d3.select(`#inner-container-${i + 1}`)
      .transition()
      .duration(200)
      .ease('linear')
      .attr('transform', `translate(${words[i].centerX * w}, ${words[i].centerY * h})`)

    /*     
    // for debug (draw real bounding box)
    d3.select(`#rect-${i + 1}`)
      .transition()
      .duration(100)
      .attr('x', words[i].centerX * w - (words[i].rateWidth * w) / 2)
      .attr('y', words[i].centerY * h - (words[i].rateHeight * h) / 2)
      .attr('width', words[i].rateWidth * w)
      .attr('height', words[i].rateHeight * h) */
  }
}
