d3.layout.cloud = function() {

    var size = [256, 256],
        text = cloudText,
        font = cloudFont,
        fontSize = cloudFontSize,
        fontStyle = cloudFontNormal,
        fontWeight = cloudFontNormal,
        rotate = cloudRotate,
        spiral = archimedeanSpiral,
        words = [],
        cloud = {},
        canvas = cloudCanvas;

    cloud.start = function() {
        //Init
        var tags = [],
            data = words.map(function(d, i) {
                d.text = text.call(this, d, i);
                d.font = font.call(this, d, i);
                d.style = fontStyle.call(this, d, i);
                d.weight = fontWeight.call(this, d, i);
                d.rotate = rotate.call(this, d, i);
                d.size = ~~fontSize.call(this, d, i);
                d.width = words.width;
                d.height = words.height;
                return d;
            }).sort(function(a, b) { return b.size - a.size; });

        let n = data.length;
        let total_num = 0;
        for(let i = 0;i < n;i++) {
            total_num += data[i].size;
            //max_num = Math.max(max_num,data[i].size);
        }
        for(let i = 0;i < n ;i++){
            data[i].size = data[i].size / total_num;
            //console.log(data[i].size);
        }

        WeightWordBox(data,size);
        allWordSpiral(data,size,tags);

        //console.log(tags);
        return tags;
    }

    cloud.words = function(_) {
        return arguments.length ? (words = _, cloud) : words;
    };

    cloud.size = function(_) {
        return arguments.length ? (size = [+_[0], +_[1]], cloud) : size;
    };

    cloud.font = function(_) {
        return arguments.length ? (font = functor(_), cloud) : font;
    };

    cloud.fontStyle = function(_) {
        return arguments.length ? (fontStyle = functor(_), cloud) : fontStyle;
    };

    cloud.fontWeight = function(_) {
        return arguments.length ? (fontWeight = functor(_), cloud) : fontWeight;
    };

    cloud.rotate = function(_) {
        return arguments.length ? (rotate = functor(_), cloud) : rotate;
    };

    cloud.text = function(_) {
        return arguments.length ? (text = functor(_), cloud) : text;
    };

    cloud.spiral = function(_) {
        return arguments.length ? (spiral = spirals[_] || _, cloud) : spiral;
    };

    cloud.fontSize = function(_) {
        return arguments.length ? (fontSize = functor(_), cloud) : fontSize;
    };

    function getContext(canvas) {
        canvas.width = size[0];
        canvas.height = size[1];
        var context = canvas.getContext("2d");
        context.fillStyle = context.strokeStyle = "red";
        context.textAlign = "center";
        return context;
    }

    return cloud;
};

/*
function WeightWordBox(c,data){

  var i = -1,
      n = data.length,
      cloudRadians = Math.PI / 180,
      d;

  while (++i < n) {
    d = data[i];
    c.font = d.style + " " + d.weight + " " + ~~(d.size) + "px " + d.font;

    //measureText(text).width:返回以像素为单位的文本的宽度
    console.log(c.measureText(d.text));

    var w = c.measureText(d.text + "m").width,
        h = d.size;

    if (d.rotate) {
      var sr = Math.sin(d.rotate * cloudRadians),
          cr = Math.cos(d.rotate * cloudRadians),
          wcr = w * cr,
          wsr = w * sr,
          hcr = h * cr,
          hsr = h * sr;
      w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)));
      h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
    }
    data[i].width = w;
    data[i].height = h;
  }
}
 */

function WeightWordBox(data,size){

    var i = -1,
        n = data.length;

    var TotalSquare = size[0] * size[1];

    d3.select("#vis").append("svg")
        .attr("width", size[0])
        .attr("height", size[1])
        .append("g")
        .attr("transform", "translate(" +size[0] /2 + "," + size[1] / 2 + ")")
        .selectAll("text")
        .data(data)
        .enter().append("text")
        .style("font-size", function(d) { return ~~(Math.sqrt(d.size * TotalSquare / 2) - 1)  + "px"; })
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [size[0] / 2, size[1] / 2] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });

    var groupElement = document.querySelectorAll('text');

    while (++i < n) {
        var bboxGroup = groupElement[i].getBoundingClientRect();
        data[i].width = ~~(bboxGroup.width + 5);
        data[i].height = ~~(bboxGroup.height + 5);
        //console.log(data[i].width);
    }

    var obj = document.getElementById("vis");
    obj.innerHTML = "";

}

function isWordOverlap(wordA, wordB, ir = true) {
    //collision detection in word level.
    if (wordA === wordB) {
        return false
    }

    const Ax = wordA.x0 + wordA.width;
    const Ay = wordA.y0 - wordA.height;
    const Bx = wordB.x0 + wordB.width;
    const By = wordB.y0 - wordB.height;

    let res;

    res = Ax > wordB.x0 && Bx > wordA.x0 && wordA.y0 > By && wordB.y0 > Ay;

    if (ir) {
        res = isWordOverlap(wordB, wordA, false);
    }

    return res

}

function isWordOverlapAll(CurWord, tags){
    let n = tags.length;
    if (n == 0){
        return false;
    }
    //let lastidx = lastcheck.idx;
    for(let i = 0;i < n;i++){
        if(isWordOverlap(CurWord,tags[i])){
            //lastcheck.idx = i
            return true;
        }
    }
    return false;
}

function allWordSpiral(words,size,tags) {

    var TotalSquare = size[0] * size[1];
    const increase = 0.5;
    //var lastcheck = new Object();

    for (let i = 0; i < words.length; i++) {

        //lastcheck.idx = 0;
        let r = 2;
        let degree = 0;

        //画布中心位置
        let x = size[0]/2;
        let y = size[1]/2;

        //单词的左下角位置
        words[i].x0 = r * Math.cos(degree * Math.PI / 180) + x - words[i].width / 2;
        words[i].y0 = r * Math.sin(degree * Math.PI / 180) + y + words[i].height/ 2;

        degree += increase;

        let FinishFlag = true;

        //碰撞检测
        while (isWordOverlapAll(words[i],tags)) {

            words[i].x0 = r * Math.cos(degree * Math.PI / 180) + x - words[i].width / 2;
            words[i].y0 = r * Math.sin(degree * Math.PI / 180) + y + words[i].height / 2;

            if(words[i].x0 < 0 || words[i].y0 > 2 * y || words[i].x0 + words[i].width > 2 * x|| words[i].y0 - words[i].height < 0) {
                FinishFlag = false;
                break;
            }

            degree += increase;
            r = r + 0.01;

        }

        //console.log("LastCheck:" + lastcheck.idx);

        if(FinishFlag){
            let xx,yy;
            if(!words[i].rotate){
                xx = words[i].x0 + words[i].width / 2 - x;
                yy = words[i].y0 - words[i].height / 5 - y;
            }
            else{
                xx = words[i].x0 + words[i].width / 5 - x;
                yy = words[i].y0 - words[i].height / 2 - y;
            }
            words[i].x = xx / size[0];
            words[i].y = yy / size[1];
            words[i].CenterX = (words[i].x0 + words[i].width / 2 - x) / size[0];
            words[i].CenterY = (words[i].y0 - words[i].height / 2 - y) / size[1];
            words[i].LeftUpX = (words[i].x0 - x) / size[0];
            words[i].LeftUpY = (words[i].y0 - words[i].height - y) / size[1];
            words[i].RateWidth = words[i].width / size[0];
            words[i].RateHeight = words[i].height / size[1];
            //console.log("width: " + words[i].width + "wwidth: " + words[i].wwidth);
            //words[i].size = ssize / TotalSquare;
            tags.push(words[i]);
        }

    }

}

function cloudText(d) {
    return d.text;
}

function cloudFont() {
    return "serif";
}

function cloudFontNormal() {
    return "normal";
}

function cloudFontSize(d) {
    return Math.sqrt(d.value);
}

function cloudRotate() {
    //return ~~(Math.random() * 2) * 90;
    return (~~(Math.random() * 6) - 3) * 30;
}

function archimedeanSpiral(size) {
    var e = size[0] / size[1];
    return function(t) {
        return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
    };
}

function functor(d) {
    return typeof d === "function" ? d : function() { return d; };
}

function cloudCanvas() {
    return document.createElement("canvas");
}