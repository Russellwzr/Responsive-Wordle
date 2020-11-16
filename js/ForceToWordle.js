function ForceToWordle(words,CenterX,CenterY) {

    var  b2Vec2 = Box2D.Common.Math.b2Vec2
        ,  b2AABB = Box2D.Collision.b2AABB
        ,  b2BodyDef = Box2D.Dynamics.b2BodyDef
        ,  b2Body = Box2D.Dynamics.b2Body
        ,  b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        ,  b2Fixture = Box2D.Dynamics.b2Fixture
        ,  b2World = Box2D.Dynamics.b2World
        ,  b2MassData = Box2D.Collision.Shapes.b2MassData
        ,  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        ,  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        ,  b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        ,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    ;

    //var wordsnum = words.length;
    var SavedWords = SaveTheWordBox(words);
    var worldScale = 30; // box2d中以米为单位，1米=30像素
    var gravity = new b2Vec2(0, 0);
    var sleep = true;
    var world;
    var velIterations = 10;// 速率约束解算器
    var posIterations = 10;// 位置约束解算器
    var IterNum;
    var BodyTop,BodyBottom,BodyLeft,BodyRight;
    var SetInter;
    var alpha = 0.1;
    var lambta = 0.8;
    var beta = 1.2;
    var ForceScale = 200;

    function main(){

        //draw_with_scale(words,CenterX * 2,CenterY * 2);

        world = new b2World(gravity, sleep);
        //debugDraw();
        ReSizeTheWordBox();
        //CreateWordleBox(words);
        //Create Boundary
        BodyTop = Boundary(CenterX,0,CenterX * 2,1);
        BodyBottom = Boundary(CenterX,CenterY * 2,CenterX * 2,1);
        BodyLeft = Boundary(0,CenterY,1,CenterY * 2);
        BodyRight = Boundary(CenterX * 2,CenterY,1,CenterY * 2);
        IterNum = 0;
        /*
        for(; IterNum < 200 ; IterNum++){
            updateWorld();
        }
         */
        //Create Update SetInterVal

        SetInter = setInterval(updateWorld, 1000/60);

    }

    main();

    function ReSizeTheWordBox(){

        ReSetTheWordBox();
        let obj = document.getElementById("vis");
        obj.innerHTML = "";

        let w = CenterX * 2,
            h = CenterY * 2,
            rate = w * h;

        //console.log("(" + w + ", " + h + ")");

        words = draw_with_scale(words, w, h);

        console.log("After filter" + words.length);

        /*
        d3.select("#vis").append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + CenterX + "," + CenterY + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return ~~(Math.sqrt(d.size * rate / 2) - 1) + "px"; })
            .style("font-family", "Impact")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x * w, d.y * h] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text;});
         */

        let i = -1,
            n = words.length,
            groupElement = document.querySelectorAll('text');

        while (++i < n ) {
            let bboxGroup = groupElement[i].getBoundingClientRect();
            words[i].RateWidth =  bboxGroup.width / w;
            words[i].RateHeight = bboxGroup.height / h;
            RectBox(words[i].CenterX * w + CenterX ,words[i].CenterY * h + CenterY,words[i].RateWidth * w,words[i].RateHeight * h,words[i].text);
            //console.log(data[i].width);
        }

        draw_without_scale(words,CenterX * 2,CenterY * 2);
        //obj.innerHTML = "";
    }

    //Deep Clone
    function SaveTheWordBox(arr){
        var obj=arr.constructor==Array?[]:{};
        for(var item in arr){
            if(typeof arr[item]==="object"){
                obj[item]=SaveTheWordBox(arr[item]);
            }else{
                obj[item]=arr[item];
            }
        }
        return obj;
    }

    function ReSetTheWordBox(){
        /*
        for(let i = 0;i < wordsnum;i++){
            words[i].CenterX = SavedWords[i].CenterX;
            words[i].CenterY = SavedWords[i].CenterY;
            words[i].LeftUpX = SavedWords[i].LeftUpX;
            words[i].LeftUpY = SavedWords[i].CenterY;
            words[i].RateHeight = SavedWords[i].RateHeight;
            words[i].RateWidth = SavedWords[i].RateWidth;
            words[i].height = SavedWords[i].height;
            words[i].rotate = SavedWords[i].rotate;
            words[i].size = SavedWords[i].size;
            words[i].width = SavedWords[i].width;
            words[i].x = SavedWords[i].x;
            words[i].x0 = SavedWords[i].x0;
            words[i].y = SavedWords[i].y;
            words[i].y0 = SavedWords[i].y0;
        }
         */
        words = SaveTheWordBox(SavedWords);
    }

    function RectBox(px, py, w, h, text){

        var bodyDef = new b2BodyDef();
        bodyDef.position.Set(px/worldScale, py/worldScale);
        bodyDef.type = b2Body.b2_dynamicBody;
        var polygonShape = new b2PolygonShape();
        polygonShape.SetAsBox(w/2/worldScale, h/2/worldScale);
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = polygonShape;
        fixtureDef.density = 1;
        fixtureDef.restitution = .2;
        fixtureDef.friction = .6;
        var theBrick = world.CreateBody(bodyDef);
        theBrick.CreateFixture(fixtureDef);
        theBrick.m_rotation = 0;
        theBrick.m_torque = 0;
        theBrick.width = w / 2;
        theBrick.height = h / 2;
        theBrick.quality = (w/worldScale) * (h/worldScale);
        theBrick.text = text;
        //console.log(theBrick);

    }

    function Boundary(px,py,w,h){

        var bodyDef = new b2BodyDef();
        bodyDef.position.Set(px/worldScale, py/worldScale);
        bodyDef.type = b2Body.b2_staticBody;
        var polygonShape = new b2PolygonShape();
        polygonShape.SetAsBox(w/2/worldScale, h/2/worldScale);
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = polygonShape;
        fixtureDef.density = 1;
        fixtureDef.restitution = .3;
        fixtureDef.friction = .8;
        var theBrick = world.CreateBody(bodyDef);
        theBrick.CreateFixture(fixtureDef);
        theBrick.width = w / 2;
        theBrick.height = h / 2;
        theBrick.quality = 0;
        return theBrick;

    }

    function isCrossTheLine(BoxA, BoxB, ir = true) {
        if (BoxA === BoxB) {
            return false
        }
        let res = false;
        res |= BoxA.x1 > BoxB.x0 && BoxB.x1 > BoxA.x0 && BoxA.y0 > BoxB.y1 && BoxB.y0 > BoxA.y1;
        if (ir) {
            res |= isCrossTheLine(BoxB, BoxA, false);
        }
        return res
    }

    function AddExternalForces(){

        //console.log("AddForces");

        for (let A = world.m_bodyList; A != null; A = A.m_next){
            if ((A == BodyBottom) || (A == BodyTop) || (A == BodyLeft) || (A == BodyRight) || A.quality == null){
                continue;
            }

            //console.log("(" + A.quality + ", " + A.text + ")");

            //Central Force
            let distanceX = CenterX - (A.GetPosition().x) * worldScale;
            let distanceY = CenterY - (A.GetPosition().y) * worldScale;
            let distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

            let ForceXY = 10 * ForceScale * A.quality * (distanceXY/worldScale) * (distanceXY/worldScale) * (beta/(IterNum + 1)) * alpha;
            let ForceX = ForceXY * distanceX / distanceXY;
            let ForceY = ForceXY * distanceY / distanceXY;

            A.ApplyForce(new b2Vec2(ForceX,ForceY),new b2Vec2(CenterX/worldScale,CenterY/worldScale));

            //Neighbor Force
            //CurPoint
            let Point1 = {x:(A.GetPosition().x) * worldScale,y:(A.GetPosition().y) * worldScale};
            //Find Neighbors
            for(let B = world.m_bodyList; B != null; B = B.m_next){
                if ((B == BodyBottom) || (B == BodyTop) || (B == BodyLeft) || (B == BodyRight)||(B.quality == null)){
                    continue;
                }
                let Point2 = {x:(B.GetPosition().x) * worldScale,y:(B.GetPosition().y) * worldScale};
                if((Point1.x == Point2.x) && (Point1.y == Point2.y)){
                    continue;
                }
                let Box1 = {x0:Math.min(Point1.x,Point2.x),y0:Math.max(Point1.y,Point2.y),x1:Math.max(Point1.x,Point2.x),y1:Math.min(Point1.y,Point2.y)};
                //Judge Neighbors
                for(let C = world.m_bodyList; C != null; C = C.m_next){
                    if ((C == BodyBottom) || (C == BodyTop) || (C == BodyLeft) || (C == BodyRight) || (C.quality == null)){
                        continue;
                    }
                    let Point3 = {x:(C.GetPosition().x) * worldScale,y:(C.GetPosition().y) * worldScale};
                    if(((Point1.x == Point3.x) && (Point1.y == Point3.y))||((Point3.x == Point2.x) && (Point3.y == Point2.y))) {
                        continue;
                    }
                    let Box2 = {x0:Point3.x - C.width, y0:Point3.y + C.height, x1:Point3.x + C.width, y1:Point3.y - C.height};
                    if(isCrossTheLine(Box1,Box2)){
                        distanceX = Point2.x - Point1.x;
                        distanceY = Point2.y - Point1.y;
                        distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                        ForceXY = ((ForceScale * A.quality * B.quality) / ((distanceXY/worldScale) * (distanceXY/worldScale))) * (beta/(IterNum + 1));
                        ForceX = ForceXY * distanceX / distanceXY;
                        ForceY = ForceXY * distanceY / distanceXY;
                        A.ApplyForce(new b2Vec2(ForceX,ForceY),new b2Vec2(Point2.x/worldScale,Point2.y/worldScale));
                    }
                }
            }

            //Damping Strategy
            let preVelocity = {x:A.GetLinearVelocity().x,y:A.GetLinearVelocity().y};
            if(IterNum < 5){
                A.SetLinearVelocity(new b2Vec2(preVelocity.x * lambta,preVelocity.y * lambta));
            }
            else if(IterNum >= 5 && IterNum < 10){
                lambta *= 0.9;
                A.SetLinearVelocity(new b2Vec2(preVelocity.x * lambta,preVelocity.y * lambta));
            }
            else{
                A.SetAngularVelocity(0);
                A.SetLinearVelocity(new b2Vec2(0,0));
                A.SetAngle(0);
            }
        }
    }

    function ReLocateTheBox(){
        let idx = words.length - 1;
        for (let b = world.m_bodyList; b != null; b = b.m_next){
            if ((b != BodyBottom) && (b != BodyTop) && (b != BodyLeft) && (b != BodyRight) && (b.quality!=null)){
                //console.log(b);
                b.SetAngle(0);
                let xy = b.GetPosition();

                //console.log(xy);
                words[idx].CenterX = (xy.x * worldScale - CenterX) / (CenterX * 2);
                words[idx].CenterY = (xy.y * worldScale - CenterY) / (CenterY * 2);

                //console.log("(" + words[idx].CenterX * CenterX + ", "+ words[idx].CenterY * CenterY +")");

                words[idx].LeftUpX = words[idx].CenterX - words[idx].RateWidth / 2;
                words[idx].LeftUpY = words[idx].CenterY - words[idx].RateHeight / 2;

                if(!words[idx].rotate){
                    words[idx].x = words[idx].CenterX;
                    words[idx].y = words[idx].CenterY + 3/10 * words[idx].RateHeight;
                }
                else{
                    words[idx].x = words[idx].CenterX - 3/10 * words[idx].RateWidth;
                    words[idx].y = words[idx].CenterY;
                }

                idx--;

                if(idx < 0){
                    break;
                }

            }
        }
    }

    function updateWorld() {

        //let obj = document.getElementById("vis");
        //obj.innerHTML = "";

        let w = document.documentElement.clientWidth;
        let h = document.documentElement.clientHeight;

        if(~~(0.4 * w) != CenterX || ~~(0.4 * h) != CenterY ){
            clearInterval(SetInter);
            draw_without_scale_1(words,CenterX * 2,CenterY * 2);
            ReSetTheWordBox();
        }

        IterNum++;

        if(IterNum >= 30){
            for(let b = world.m_bodyList; b != null; b = b.m_next){
                if ((b != BodyBottom) && (b != BodyTop) && (b != BodyLeft) && (b != BodyRight)){
                    b.SetAngle(0);
                    //console.log(b.GetAngle() * 180 / Math.PI);
                }
            }
            //draw(words,CenterX * 2,CenterY * 2);
            clearInterval(SetInter);
            draw_without_scale_1(words,CenterX * 2,CenterY * 2);
            ReSetTheWordBox();
            return;
        }

        AddExternalForces();

        for (let b = world.m_contactList; b; b = b.m_next)
            // 遍历contactlist所有世界，直到b不存在，跳出循环
        {
            //console.log(b);
            // 将b里的两个刚体分别定义为b1和b2
            let b1 = b.m_fixtureA.m_body;
            let b2 = b.m_fixtureB.m_body;
            // 向下执行的条件是b1和b2不同，且挡板
            if ((b1 != b2) && (b1 != BodyBottom) && (b1 != BodyTop) && (b1 != BodyLeft) && (b1 != BodyRight) && (b2 != BodyBottom) && (b2 != BodyTop) && (b2 != BodyLeft) && (b2 != BodyRight)){
                b1.SetAngularVelocity(0);
                b2.SetAngularVelocity(0);
                b1.SetLinearVelocity(new b2Vec2(0,0));
                b2.SetLinearVelocity(new b2Vec2(0,0));
                b1.SetAngle(0);
                b2.SetAngle(0);
                //b1.SetLinearVelocity(0);
            }
        }

        ReLocateTheBox();
       // draw_without_scale(words,CenterX * 2,CenterY * 2);
        world.Step(1/60, velIterations, posIterations);// 更新世界模拟
        //world.DrawDebugData(); // 显示刚体debug轮廓
        world.ClearForces(); // 清除作用力

    }

    //setup debug draw
    function debugDraw(){
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
        debugDraw.SetDrawScale(worldScale);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);
    }

};