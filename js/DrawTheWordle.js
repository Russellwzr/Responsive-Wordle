function draw_with_scale(words, w, h) {

    var obj = document.getElementById("vis");
    obj.innerHTML = "";

    let rate = w * h,
        j=0;

    /*
    d3.select("#vis").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
        .selectAll("rect")
        .data(words)
        .enter().append("rect")
        .attr('x',function (d) {
            return d.LeftUpX * w;
        })
        .attr('y',function (d){
            return d.LeftUpY * h;
        })
        .attr("width", function(d) {return d.RateWidth * w; })
        .attr("height", function(d) {return d.RateHeight * h; })
        .attr('stroke', 'red')
        .attr("fill","white");

     */

    d3.select("#vis").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
        //.select("g")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .attr("id",function(d){
            j++;
            let CurId = "id" + j;
            return CurId;
        })
        .style("font-size",function (d) {
            return ~~(Math.sqrt(d.size * rate / 2) - 1)  + "px";
        })
        .style("font-family", "Impact")
        .style("fill", function(d, i) {return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x * w, d.y * h] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });

    let n = words.length;

    for(let i = 1;i <= n;i++){
        //console.log(words[i-1].text);
        let CurId = "#id"+i,
            CurFontSize = ~~(Math.sqrt(words[i-1].size * rate / 2) - 1);

        words[i-1].tmpsize = CurFontSize;

        let groupElement = document.getElementById("id"+i);
        let bboxGroup = groupElement.getBoundingClientRect();

        let CurX = words[i-1].CenterX * w,
            CurY = words[i-1].CenterY * h;

        let CurWidth = bboxGroup.width,
            CurHeight = bboxGroup.height,
            BoundingWidth = words[i-1].RateWidth * w,
            BoundingHeight = words[i-1].RateHeight * h;

        if((BoundingWidth < BoundingHeight && words[i-1].rotate == 0)||(BoundingWidth > BoundingHeight && words[i-1].rotate == 90)){
            //console.log("Before: " + CurWidth +", " + CurHeight+", "+words[i-1].rotate);
            let tmp = CurWidth;
            CurWidth = CurHeight;
            CurHeight = tmp;
            words[i-1].rotate = 90 - words[i-1].rotate;
        }

        //console.log("After: " + CurWidth +", " + CurHeight+", "+words[i-1].rotate);

        let FontBounding = new Object();
        let BoxBounding = new Object();

        FontBounding.x0 = CurX - CurWidth / 2;
        FontBounding.y0 = CurY + CurHeight / 2;
        FontBounding.x1 = CurX + CurWidth / 2;
        FontBounding.y1 = CurY - CurHeight / 2;

        BoxBounding.x0 = CurX - BoundingWidth / 2;
        BoxBounding.y0 = CurY + BoundingHeight / 2;
        BoxBounding.x1 = CurX + BoundingWidth / 2;
        BoxBounding.y1 = CurY - BoundingHeight / 2;

        //console.log(FontBounding);
        //console.log(BoxBounding);

        let p = d3.select("body").select("svg").select("g").select(CurId);

        while(!((FontBounding.x0 >= BoxBounding.x0)&&(FontBounding.y0 <= BoxBounding.y0)&&(FontBounding.x1 <= BoxBounding.x1)&&(FontBounding.y1 >= BoxBounding.y1))){
            CurFontSize--;
            if(CurFontSize <= 0){
                break;
            }

            //水平
            if(words[i-1].rotate == 0){
                p.attr("transform","translate(" + [CurX, FontBounding.y0] + ")rotate(" + words[i-1].rotate + ")")
                    .style("font-size",CurFontSize+"px");
            }
            //竖直
            else{
                p.attr("transform","translate(" + [FontBounding.x0,CurY] + ")rotate(" + words[i-1].rotate + ")")
                    .style("font-size",CurFontSize+"px");
            }

            groupElement = document.getElementById("id"+i);
            bboxGroup = groupElement.getBoundingClientRect();
            CurWidth = bboxGroup.width;
            CurHeight = bboxGroup.height;
            FontBounding.x0 = CurX - CurWidth / 2;
            FontBounding.y0 = CurY + CurHeight / 2;
            FontBounding.x1 = CurX + CurWidth / 2;
            FontBounding.y1 = CurY - CurHeight / 2;
        }

        //水平
        if(words[i-1].rotate == 0){
            p.attr("transform","translate(" + [CurX, FontBounding.y0 - CurHeight / 5] + ")rotate(" + words[i-1].rotate + ")")
                .style("font-size",CurFontSize+"px");
            words[i-1].tmpsize = CurFontSize;
        }
        //竖直
        else{
            p.attr("transform","translate(" + [FontBounding.x0 + CurWidth / 5,CurY] + ")rotate(" + words[i-1].rotate + ")")
                .style("font-size",CurFontSize+"px");
            words[i-1].tmpsize = CurFontSize;
        }

    }

    console.log("Before filter" + words.length);

    words = words.filter(item => {
        return item.tmpsize > 15;
    })

    return words;

}


function draw_without_scale(words, w, h){
    var obj = document.getElementById("vis");
    obj.innerHTML = "";

    let rate = w * h,
        j=0;

    /*
    d3.select("#vis").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
        .selectAll("rect")
        .data(words)
        .enter().append("rect")
        .attr('x',function (d) {
            return d.LeftUpX * w;
        })
        .attr('y',function (d){
            return d.LeftUpY * h;
        })
        .attr("width", function(d) {return d.RateWidth * w; })
        .attr("height", function(d) {return d.RateHeight * h; })
        .attr('stroke', 'red')
        .attr("fill","white");

     */

    d3.select("#vis").append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
        //.select("g")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .attr("id",function(d){
            j++;
            let CurId = "id" + j;
            return CurId;
        })
        .style("font-size",function (d) {
            return d.tmpsize  + "px";
        })
        .style("font-family", "Impact")
        .style("fill", function(d, i) {return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x * w, d.y * h] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}

function draw_without_scale_1(words, w, h){
    let n = words.length;
    let j = 1;
    for(let i =0;i<n;i++,j++){
        let word1 = d3.select("#id" + j);
        let endfontsize = words[i].tmpsize + "px";
        let endtransform = "translate(" + [words[i].x * w, words[i].y * h] + ")rotate(" + words[i].rotate + ")";
        word1.transition()
            .duration(200)
            .style("font-size",endfontsize)
            .attr("transform",endtransform);
    }
}