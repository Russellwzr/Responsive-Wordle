function forceToWordle(words, centerX, centerY) {
  var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2World = Box2D.Dynamics.b2World,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
  var savedWords = deepCloneArray(words)
  var worldScale = 30 // in box2d 1m=30px
  var gravity = new b2Vec2(0, 0)
  var sleep = true
  var world
  var velIterations = 10 // velocity constraint
  var posIterations = 10 // position constraint
  var iterNum
  var bodyTop, bodyBottom, bodyLeft, bodyRight
  var setInter
  var alpha = 0.1
  var lambta = 0.8
  var beta = 1.2
  var forceScale = 200

  function start() {
    world = new b2World(gravity, sleep)
    reSizeTheWordBox()
    // create boundary
    bodyTop = boundary(centerX, 0, centerX * 2, 1)
    bodyBottom = boundary(centerX, centerY * 2, centerX * 2, 1)
    bodyLeft = boundary(0, centerY, 1, centerY * 2)
    bodyRight = boundary(centerX * 2, centerY, 1, centerY * 2)
    iterNum = 0
    // create update setInterVal
    setInter = setInterval(updateWorld, 1000 / 60)
  }

  start()

  function reSizeTheWordBox() {
    reSetTheWordBox()

    let w = centerX * 2,
      h = centerY * 2

    words = drawWithScale(words, w, h)

    let i = -1,
      n = words.length,
      groupElement = document.querySelectorAll('text')

    while (++i < n) {
      let bboxGroup = groupElement[i].getBoundingClientRect()
      words[i].rateWidth = bboxGroup.width / w
      words[i].rateHeight = bboxGroup.height / h
      rectBox(
        words[i].centerX * w + centerX,
        words[i].centerY * h + centerY,
        words[i].rateWidth * w,
        words[i].rateHeight * h,
        words[i].text,
      )
    }

    drawWithoutScale(words, centerX * 2, centerY * 2)
  }

  // deep clone
  function deepCloneArray(arr) {
    var obj = arr.constructor == Array ? [] : {}
    for (var item in arr) {
      if (typeof arr[item] === 'object') {
        obj[item] = deepCloneArray(arr[item])
      } else {
        obj[item] = arr[item]
      }
    }
    return obj
  }

  function reSetTheWordBox() {
    words = deepCloneArray(savedWords)
  }

  function rectBox(px, py, w, h, text) {
    var bodyDef = new b2BodyDef()
    bodyDef.position.Set(px / worldScale, py / worldScale)
    bodyDef.type = b2Body.b2_dynamicBody
    var polygonShape = new b2PolygonShape()
    polygonShape.SetAsBox(w / 2 / worldScale, h / 2 / worldScale)
    var fixtureDef = new b2FixtureDef()
    fixtureDef.shape = polygonShape
    fixtureDef.density = 1
    fixtureDef.restitution = 0.2
    fixtureDef.friction = 0.6
    var theBrick = world.CreateBody(bodyDef)
    theBrick.CreateFixture(fixtureDef)
    theBrick.m_rotation = 0
    theBrick.m_torque = 0
    theBrick.width = w / 2
    theBrick.height = h / 2
    theBrick.quality = (w / worldScale) * (h / worldScale)
    theBrick.text = text
  }

  function boundary(px, py, w, h) {
    var bodyDef = new b2BodyDef()
    bodyDef.position.Set(px / worldScale, py / worldScale)
    bodyDef.type = b2Body.b2_staticBody
    var polygonShape = new b2PolygonShape()
    polygonShape.SetAsBox(w / 2 / worldScale, h / 2 / worldScale)
    var fixtureDef = new b2FixtureDef()
    fixtureDef.shape = polygonShape
    fixtureDef.density = 1
    fixtureDef.restitution = 0.3
    fixtureDef.friction = 0.8
    var theBrick = world.CreateBody(bodyDef)
    theBrick.CreateFixture(fixtureDef)
    theBrick.width = w / 2
    theBrick.height = h / 2
    theBrick.quality = 0
    return theBrick
  }

  function isCrossTheLine(boxA, boxB, ir = true) {
    if (boxA === boxB) {
      return false
    }
    let res = false
    res |= boxA.x1 > boxB.x0 && boxB.x1 > boxA.x0 && boxA.y0 > boxB.y1 && boxB.y0 > boxA.y1
    if (ir) {
      res |= isCrossTheLine(boxB, boxA, false)
    }
    return res
  }

  // the algorithm interpretation in the "material/Responsive Wordle.pdf"
  function addExternalForces() {
    for (let A = world.m_bodyList; A != null; A = A.m_next) {
      if (A == bodyBottom || A == bodyTop || A == bodyLeft || A == bodyRight || A.quality == null) {
        continue
      }

      // add central force
      let distanceX = centerX - A.GetPosition().x * worldScale
      let distanceY = centerY - A.GetPosition().y * worldScale
      let distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))

      let forceXY =
        10 *
        forceScale *
        A.quality *
        (distanceXY / worldScale) *
        (distanceXY / worldScale) *
        (beta / (iterNum + 1)) *
        alpha
      let forceX = (forceXY * distanceX) / distanceXY
      let forceY = (forceXY * distanceY) / distanceXY

      A.ApplyForce(new b2Vec2(forceX, forceY), new b2Vec2(centerX / worldScale, centerY / worldScale))

      // add neighbor force
      let point1 = { x: A.GetPosition().x * worldScale, y: A.GetPosition().y * worldScale }
      // find neighbors
      for (let B = world.m_bodyList; B != null; B = B.m_next) {
        if (B == bodyBottom || B == bodyTop || B == bodyLeft || B == bodyRight || B.quality == null) {
          continue
        }
        let point2 = { x: B.GetPosition().x * worldScale, y: B.GetPosition().y * worldScale }
        if (point1.x == point2.x && point1.y == point2.y) {
          continue
        }
        let box1 = {
          x0: Math.min(point1.x, point2.x),
          y0: Math.max(point1.y, point2.y),
          x1: Math.max(point1.x, point2.x),
          y1: Math.min(point1.y, point2.y),
        }
        // judge neighbors
        for (let C = world.m_bodyList; C != null; C = C.m_next) {
          if (C == bodyBottom || C == bodyTop || C == bodyLeft || C == bodyRight || C.quality == null) {
            continue
          }
          let point3 = { x: C.GetPosition().x * worldScale, y: C.GetPosition().y * worldScale }
          if ((point1.x == point3.x && point1.y == point3.y) || (point3.x == point2.x && point3.y == point2.y)) {
            continue
          }
          let box2 = {
            x0: point3.x - C.width,
            y0: point3.y + C.height,
            x1: point3.x + C.width,
            y1: point3.y - C.height,
          }
          if (isCrossTheLine(box1, box2)) {
            distanceX = point2.x - point1.x
            distanceY = point2.y - point1.y
            distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))
            forceXY =
              ((forceScale * A.quality * B.quality) / ((distanceXY / worldScale) * (distanceXY / worldScale))) *
              (beta / (iterNum + 1))
            forceX = (forceXY * distanceX) / distanceXY
            forceY = (forceXY * distanceY) / distanceXY
            A.ApplyForce(new b2Vec2(forceX, forceY), new b2Vec2(point2.x / worldScale, point2.y / worldScale))
          }
        }
      }

      // damping strategy
      let preVelocity = { x: A.GetLinearVelocity().x, y: A.GetLinearVelocity().y }
      if (iterNum < 5) {
        A.SetLinearVelocity(new b2Vec2(preVelocity.x * lambta, preVelocity.y * lambta))
      } else if (iterNum >= 5 && iterNum < 10) {
        lambta *= 0.9
        A.SetLinearVelocity(new b2Vec2(preVelocity.x * lambta, preVelocity.y * lambta))
      } else {
        A.SetAngularVelocity(0)
        A.SetLinearVelocity(new b2Vec2(0, 0))
        A.SetAngle(0)
      }
    }
  }

  function updateBoxLocation() {
    let idx = words.length - 1
    for (let b = world.m_bodyList; b != null; b = b.m_next) {
      if (b != bodyBottom && b != bodyTop && b != bodyLeft && b != bodyRight && b.quality != null) {
        b.SetAngle(0)
        let xy = b.GetPosition()

        words[idx].centerX = (xy.x * worldScale - centerX) / (centerX * 2)
        words[idx].centerY = (xy.y * worldScale - centerY) / (centerY * 2)

        words[idx].leftUpX = words[idx].centerX - words[idx].rateWidth / 2
        words[idx].leftUpY = words[idx].centerY - words[idx].rateHeight / 2

        if (!words[idx].rotate) {
          words[idx].x = words[idx].centerX
          words[idx].y = words[idx].centerY + (3 / 10) * words[idx].rateHeight
        } else {
          words[idx].x = words[idx].centerX - (3 / 10) * words[idx].rateWidth
          words[idx].y = words[idx].centerY
        }

        idx--

        if (idx < 0) {
          break
        }
      }
    }
  }

  function updateWorld() {
    let w = document.documentElement.clientWidth
    let h = document.documentElement.clientHeight

    iterNum++

    if (~~(0.4 * w) != centerX || ~~(0.4 * h) != centerY || iterNum >= 30) {
      clearInterval(setInter)
      startUpdateTransition(words, centerX * 2, centerY * 2)
      reSetTheWordBox()
      return
    }

    addExternalForces()

    updateBoxLocation()

    world.Step(1 / 60, velIterations, posIterations)
    world.ClearForces()
  }
}
