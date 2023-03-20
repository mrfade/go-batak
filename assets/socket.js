const { createApp } = Vue
const host = window.location.hostname
const port = window.location.port
const secure = window.location.protocol === 'https:'
const socket = new WebSocket(`ws${secure ? 's' : ''}://${host}:${port}/ws`)

function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const mockCards = [
  { id: 'e292fcfd-de4e-4b03-836c-887d11e819d6', type: 'spade', number: 'A', status: 'indeck' },
  { id: '52311077-18ed-4ee1-8ccc-f6383aea53b1', type: 'spade', number: 'K', status: 'indeck' },
  { id: 'bc25eed8-3601-416a-bddc-4bdd51adf1e2', type: 'spade', number: 'Q', status: 'indeck' },
  { id: 'e0771b5a-d5b1-4e98-a24c-0782a2176f20', type: 'spade', number: 'J', status: 'indeck' },
  { id: '2d26ca3b-661b-4974-9d83-c8539f994dd2', type: 'spade', number: '10', status: 'indeck' },
  { id: '41ed034c-940d-491d-a332-349bc5bc83c6', type: 'spade', number: '9', status: 'indeck' },
  { id: '4bf10a4a-1378-407a-8b82-4fd634e6d9b1', type: 'spade', number: '8', status: 'indeck' },
  { id: 'b749ab8a-e7d8-4cd2-85c8-afa6cf43043c', type: 'spade', number: '7', status: 'indeck' },
  { id: '51530cf2-b6de-4cab-bf56-294e430ae488', type: 'spade', number: '6', status: 'indeck' },
  { id: 'c7778813-5f0b-4e7c-a23d-d39d7f9e9b06', type: 'spade', number: '5', status: 'indeck' },
  { id: '1bc301b1-9e49-4646-9060-c383629b8cf7', type: 'spade', number: '4', status: 'indeck' },
  { id: '09375e16-d71a-4806-a726-1376daabe496', type: 'spade', number: '3', status: 'indeck' },
  { id: 'b175e4eb-decb-488c-a25c-f0c333a0a9fc', type: 'spade', number: '2', status: 'indeck' },
]

const mockOthersCards = [
  { id: '6f5edcba-d65c-4549-a7aa-7549539ef344', type: 'heart', number: 'A', status: 'indeck', owner: 'top', position: 'top' },
  { id: '5aa66fe1-9608-4c6e-9fd3-2a21e3b7f136', type: 'heart', number: 'K', status: 'indeck', owner: 'top', position: 'top' },
  { id: '22c66f71-7f2b-4ddc-aecc-fd229c801e71', type: 'heart', number: 'Q', status: 'indeck', owner: 'top', position: 'top' },
  { id: 'a0e712ca-2d99-45d3-9980-e34a4f56b975', type: 'heart', number: 'J', status: 'indeck', owner: 'top', position: 'top' },
  { id: 'ae04781d-b83d-405d-ab41-ec2d79a85ce8', type: 'heart', number: '10', status: 'indeck', owner: 'top', position: 'top' },
  { id: '6f248f49-17f0-4ac0-86dd-f8efbd71fd47', type: 'heart', number: '9', status: 'indeck', owner: 'top', position: 'top' },
  { id: 'a9ab188a-e556-4a9f-b7bd-02234686a598', type: 'heart', number: '8', status: 'indeck', owner: 'top', position: 'top' },
  { id: 'e2e3c64b-de3d-49bd-9ef9-fb1052e5bf13', type: 'heart', number: '7', status: 'indeck', owner: 'top', position: 'top' },
  { id: '6328a29c-25bd-4931-a3ef-f4141f2c5c71', type: 'heart', number: '6', status: 'indeck', owner: 'top', position: 'top' },
  { id: 'e326c4d0-292e-4773-b5a0-da7019d4dbec', type: 'heart', number: '5', status: 'indeck', owner: 'top', position: 'top' },
  { id: '1a9a3937-0825-48cf-923e-747f3adeca29', type: 'heart', number: '4', status: 'indeck', owner: 'top', position: 'top' },
  { id: '12012e9f-8d55-4ff8-b839-7581f835bcdf', type: 'heart', number: '3', status: 'indeck', owner: 'top', position: 'top' },
  { id: '4c0d7554-c537-4973-967c-4d67eaa49df8', type: 'heart', number: '2', status: 'indeck', owner: 'top', position: 'top' },

  { id: '0ed2295e-f07f-41a1-bb4c-b2ed28210abc', type: 'club', number: 'A', status: 'indeck', owner: 'left', position: 'left' },
  { id: 'ea3a830b-ada4-4cd1-a727-cb1388d4bee1', type: 'club', number: 'K', status: 'indeck', owner: 'left', position: 'left' },
  { id: 'd7536055-8fcf-4a70-bda7-581948dbc8a6', type: 'club', number: 'Q', status: 'indeck', owner: 'left', position: 'left' },
  { id: 'b9bebca3-88d6-45d3-86c1-59ab41643406', type: 'club', number: 'J', status: 'indeck', owner: 'left', position: 'left' },
  { id: '7e847443-844b-439d-af2d-288f37e94f80', type: 'club', number: '10', status: 'indeck', owner: 'left', position: 'left' },
  { id: '66dc14a8-7bf4-40bc-9df0-858c2bcf2f19', type: 'club', number: '9', status: 'indeck', owner: 'left', position: 'left' },
  { id: '676a8d1f-c3c0-4709-a2b7-0c3dc3f85363', type: 'club', number: '8', status: 'indeck', owner: 'left', position: 'left' },
  { id: '79dcfef4-dcbc-4d72-a30c-3375fc4bf500', type: 'club', number: '7', status: 'indeck', owner: 'left', position: 'left' },
  { id: '6589b848-b115-4bb0-9b36-d5f7f989a34c', type: 'club', number: '6', status: 'indeck', owner: 'left', position: 'left' },
  { id: '8f007ae4-febb-47e7-abbb-a0023af6e832', type: 'club', number: '5', status: 'indeck', owner: 'left', position: 'left' },
  { id: '7eae299a-5a37-4bb9-9ae8-6399178daccf', type: 'club', number: '4', status: 'indeck', owner: 'left', position: 'left' },
  { id: '250f49c2-450f-4c04-977e-c34c7a87072e', type: 'club', number: '3', status: 'indeck', owner: 'left', position: 'left' },
  { id: '1a2d1e57-d9cd-40bf-a627-90c1682bccf0', type: 'club', number: '2', status: 'indeck', owner: 'left', position: 'left' },

  { id: 'a0fd7c22-d551-46f5-831c-c6ef5b79e006', type: 'diamond', number: 'A', status: 'indeck', owner: 'right', position: 'right' },
  { id: 'd225ac93-68f8-4567-af6f-6143072e5679', type: 'diamond', number: 'K', status: 'indeck', owner: 'right', position: 'right' },
  { id: '4af8f38b-efec-40c9-9404-04c8e96352f2', type: 'diamond', number: 'Q', status: 'indeck', owner: 'right', position: 'right' },
  { id: '280d2379-915e-4aae-86ad-3ce5f648b45e', type: 'diamond', number: 'J', status: 'indeck', owner: 'right', position: 'right' },
  { id: '8bdbfae8-af1c-4ffd-b1e4-fea1770f50d6', type: 'diamond', number: '10', status: 'indeck', owner: 'right', position: 'right' },
  { id: '2430ac5a-96e2-4865-b23d-ab3c19939a8d', type: 'diamond', number: '9', status: 'indeck', owner: 'right', position: 'right' },
  { id: '2a6cf094-9e00-4dd8-8af6-d34012f009d3', type: 'diamond', number: '8', status: 'indeck', owner: 'right', position: 'right' },
  { id: '1e975327-78e8-4d0e-b74d-1bc0ba0320ab', type: 'diamond', number: '7', status: 'indeck', owner: 'right', position: 'right' },
  { id: 'e2f78c83-64bb-43b2-8b80-101b83ab20e7', type: 'diamond', number: '6', status: 'indeck', owner: 'right', position: 'right' },
  { id: '7144c351-ccb6-4b4d-991e-4a6e865c8f1b', type: 'diamond', number: '5', status: 'indeck', owner: 'right', position: 'right' },
  { id: '51fec2d3-4464-4c57-8491-7b379d6e7659', type: 'diamond', number: '4', status: 'indeck', owner: 'right', position: 'right' },
  { id: 'ae1f793e-0304-4366-a0b3-fcbbfa778af5', type: 'diamond', number: '3', status: 'indeck', owner: 'right', position: 'right' },
  { id: '6dc9e9ec-e35b-4455-8296-799327b4f696', type: 'diamond', number: '2', status: 'indeck', owner: 'right', position: 'right' },
]

const playerPositions = {
  0: "bottom",
  1: "right",
  // 2: "top",
  2: "left",
  3: "left"
}

const cardTypeSortOrder = {
  spade: 1,
  heart: 2,
  club: 3,
  diamond: 4
}

const cardSortOrder = {
  A: 30,
  J: 25,
  Q: 26,
  K: 27
}

const app = createApp({
  methods: {
    joinGame() {
      this.user.name = this.user.name === '' ? this.user.id : this.user.name
      socket.send(JSON.stringify({
        type: 'join',
        userid: this.user.id,
        username: this.user.name,
        message: this.game.id
      }))
    },

    startGame() {
      socket.send(JSON.stringify({
        type: 'start',
        userid: this.user.id,
        username: this.user.name
      }))
    },

    bid(bid) {
      this.bidded = true
      this.user.bid = bid

      socket.send(JSON.stringify({
        type: 'bid',
        userid: this.user.id,
        username: this.user.name,
        message: bid.toString()
      }))
    },

    selectTrump(trump) {
      socket.send(JSON.stringify({
        type: 'selectTrump',
        userid: this.user.id,
        username: this.user.name,
        message: trump.toString()
      }))
    },

    createNewGame() {
      socket.send(JSON.stringify({
        type: 'createGame',
        userid: this.user.id,
        username: this.user.name,
      }))

      this.game.owner = this.user
      this.users.push(this.user)
    },

    onCardClick(e, card) {
      console.log('onCardClick :: card:', card)
      console.log('onCardClick :: game.stage:', this.game.stage)

      const cardNode = e.target.parentNode
      console.log('onCardClick :: cardNode:', { cardNode })

      if (this.game.stage === 'leftover') {
        this.leftovers.push(card)

        const cardIndex = this.cards.findIndex(item => item.id === card.id)
        this.cards[cardIndex].status = 'leftover'
        console.log('onCardClick :: this.cards[cardIndex]:', this.cards[cardIndex])

        if (this.leftovers.length === 4) {
          socket.send(JSON.stringify({
            type: 'selectLeftover',
            userid: this.user.id,
            username: this.user.name,
            message: JSON.stringify(this.leftovers)
          }))
        }

        return
      }

      if (!this.myturn) return
      if (this.isDisabledCard(card)) return

      // TODO:
      cardNode.style.setProperty('transform', `rotate(${getRandomInt(-10, 10)}deg) translate3d(${-30 * this.scale}px, ${160 * this.scale}px, 0px) rotate(0deg) rotateY(0deg) scale(${this.scale}) rotateY(360deg)`)

      socket.send(JSON.stringify({
        type: 'sendCard',
        userid: this.user.id,
        username: this.user.name,
        message: JSON.stringify(card)
      }))
      // this.cards = this.cards.filter(item => item !== card)

      const cardIndex = this.cards.findIndex(item => item.id === card.id)
      this.cards[cardIndex].status = 'indesk'
    },

    isDisabledCard(card) {
      let _r = null
      if (!this.myturn) _r = true
      if (this.animatingWinner) _r = true
      if (this.selectLeftoverStage) _r = false
      if (this.status === 'indesk') _r = true
      if (_r !== null) return _r

      if (this.desk.length === 0) return false

      const deskFirst = this.desk[0].card
      const doesUserHaveDeskType = this.cards.findIndex(item => item.type === deskFirst.type) > -1
      if (deskFirst.type !== card.type && doesUserHaveDeskType) return true

      const doesUserHaveTrump = this.cards.findIndex(item => item.type === this.game.trump) > -1
      if (!doesUserHaveDeskType && doesUserHaveTrump && card.type !== this.game.trump) return true

      const deskTypeBiggestTrump = this.desk.filter(item => item.card.type === this.game.trump).sort((a, b) => b.cmp - a.cmp).at(0)
      const doesUserHaveBiggerTrump = deskTypeBiggestTrump && this.cards.findIndex(item => item.type === this.game.trump && deskTypeBiggestTrump.cmp > card.cmp) > -1
      if (!doesUserHaveDeskType && doesUserHaveTrump && doesUserHaveBiggerTrump && card.type === this.game.trump) return true

      const deskTypeBiggest = this.desk.filter(item => item.card.type === deskFirst.type).sort((a, b) => b.cmp - a.cmp).at(0)
      const doesUserHaveBiggerDesk = deskTypeBiggest && this.cards.findIndex(item => item.type === deskFirst.type && item.cmp > deskTypeBiggest.cmp) > -1
      if (doesUserHaveDeskType && doesUserHaveBiggerDesk && card.cmp < deskTypeBiggest.cmp) return true

      return false
    },

    getUser(userId) {
      return this.users.find(user => user.id === userId)
    },

    adjustCardsPositions() {
      console.log('adjustCardsPositions :: triggered')

      const cardWidth = 182
      const cardHeight = 247
      const scale = this.scale
      const scaleY = this.scaleY

      const windowWidth = Math.min(window.innerWidth, 1400)
      const windowHeight = window.innerHeight

      const getRotations = (size, r) => {
        const middle = parseInt(size / 2)
        const odd = size % 2 === 1
        const values = _.range(-middle, size - middle, 1).map(x => x * r)
        if (odd) return values
        return values.map(x => x + r / 2)
      }

      const getTranslate3dX = (size, aparture) => {
        const middle = parseInt(size / 2)
        const value = cardWidth * scale * aparture
        const values = _.range(-middle, size - middle, 1).map(x => x * value)
        const odd = size % 2 === 1
        if (odd) return values
        return values.map(x => x + value / 2)
      }

      const setTransform = ({ card, cardNode, rotation, translate3dX, translate3dY, scale, index, rotateZ }) => {
        let transform = ''
        transform = `${transform} rotate(${rotation}deg)`
        transform = `${transform} translate3d(${translate3dX}px, ${translate3dY}px, 0px)`
        transform = `${transform} rotate(0deg)`
        transform = `${transform} rotateY(180deg)`
        transform = `${transform} scale(${scale})`
        transform = `${transform} rotateY(360deg)`

        if (rotateZ) transform = `${transform} rotateZ(${rotateZ}deg)`

        // console.log('setTransform', { card }, transform)

        if (card.status === 'initial') {
          cardNode.style.setProperty('transition-delay', `${0.02 * index}s`)
        }
        cardNode.style.setProperty('transform', transform)
      }

      const rotations = getRotations(this.myCardsOnDeck.length, 0.4)
      const translate3dXs = getTranslate3dX(this.myCardsOnDeck.length, 2 / 3)
      const leftoverTranslate3dXs = getTranslate3dX(this.leftovers.length, 2 / 3)
      let leftoverIndex = 0

      // my cards on deck
      for (let index = 0; index < this.myCardsOnDeck.length; index++) {
        const card = this.myCardsOnDeck[index];
        const cardNode = document.getElementById(card.id)
        if (!cardNode) {
          console.log('adjustCardsPositions :: cardNode not found', card.id)
          continue
        }

        let rotation = rotations[index]
        let translate3dX = translate3dXs[index]
        let translate3dY = windowHeight / 2 - cardHeight * scale + 125 * scale

        let transform = ''
        transform = `${transform} rotate(${rotation}deg)`
        transform = `${transform} translate3d(${translate3dX}px, ${translate3dY}px, 0px)`
        transform = `${transform} scale(${scale})`

        if (card.status === 'initial') {
          cardNode.style.setProperty('transition-delay', `${0.01 * index}s`)
        }

        cardNode.style.setProperty('transform', transform)
        cardNode.style.setProperty('z-index', index + 10)
      }

      // my all cards
      for (let index = 0; index < this.cards.length; index++) {
        const card = this.cards[index];
        const cardNode = document.getElementById(card.id)
        if (!cardNode) {
          console.log('adjustCardsPositions :: cardNode not found', card.id)
          continue
        }

        if (card.status === 'leftover') {
          console.log('adjustCardsPositions :: leftover')
          let rotation = 0
          let translate3dX = leftoverTranslate3dXs[leftoverIndex++]
          let translate3dY = 0
          setTransform({ card, cardNode, rotation, translate3dX, translate3dY, scale, leftoverIndex })
          cardNode.style.setProperty('z-index', leftoverIndex + 10)
          console.log('adjustCardsPositions :: leftover > ', { cardNode })
        }
      }

      const topRotations = getRotations(this.othersCardsTop.length, -0.7)
      const topTranslate3dXs = getTranslate3dX(this.othersCardsTop.length, 0.275)

      const leftRotations = getRotations(this.othersCardsLeft.length, -0.7)
      const leftTranslate3dXs = getTranslate3dX(this.othersCardsLeft.length, 0.275)

      const rightRotations = getRotations(this.othersCardsRight.length, -0.7).reverse()
      const rightTranslate3dXs = getTranslate3dX(this.othersCardsRight.length, 0.275).reverse()

      // top
      for (let index = 0; index < this.othersCardsTop.length; index++) {
        const card = this.othersCardsTop[index];
        const cardNode = document.getElementById(card.id)
        if (!cardNode) {
          console.log('adjustCardsPositions :: cardNode not found', card.id)
          continue
        }

        const rotation = topRotations[index]
        const translate3dX = topTranslate3dXs[index]
        const translate3dY = -windowHeight / 2 + 125 * scale

        setTransform({ card, cardNode, rotation, translate3dX, translate3dY, scale, index })
        cardNode.style.setProperty('z-index', this.othersCardsTop.length - index + 10)
      }

      // left
      for (let index = 0; index < this.othersCardsLeft.length; index++) {
        const card = this.othersCardsLeft[index];
        const cardNode = document.getElementById(card.id)
        if (!cardNode) {
          console.log('adjustCardsPositions :: cardNode not found', card.id)
          continue
        }

        const rotation = 90 - leftRotations[index]
        const translate3dX = leftTranslate3dXs[index]
        const translate3dY = windowWidth / 2 - cardHeight * scale + 125 * scale

        setTransform({ card, cardNode, rotation, translate3dX, translate3dY, scale, index })
        cardNode.style.setProperty('z-index', index + 10)
      }

      // right
      for (let index = 0; index < this.othersCardsRight.length; index++) {
        const card = this.othersCardsRight[index];
        const cardNode = document.getElementById(card.id)
        if (!cardNode) {
          console.log('adjustCardsPositions :: cardNode not found', card.id)
          continue
        }

        const rotation = -90 - rightRotations[index]
        const translate3dX = rightTranslate3dXs[index]
        const translate3dY = windowWidth / 2 - cardHeight * scale + 125 * scale
        const rotateZ = 180

        setTransform({ card, cardNode, rotation, translate3dX, translate3dY, scale, index })
        cardNode.style.setProperty('z-index', this.othersCardsRight.length - index + 10)
      }

      // cards in waste
      for (let index = 0; index < this.cardsInWaste.length; index++) {
        const card = this.cardsInWaste[index];
        const cardNode = document.getElementById(card.id)
        if (!cardNode) {
          console.log('adjustCardsPositions :: cardNode not found', card.id)
          continue
        }

        let rotation = 0
        let translate3dX = 0
        let translate3dY = windowWidth / 2

        if (card.position === 'right') {
          rotation = 90
          translate3dX = 0
          translate3dY = -windowWidth / 2 - cardHeight * scale
        } else if (card.position === 'top') {
          translate3dX = 0
          translate3dY = -windowWidth / 2 - cardHeight * scale
        } else if (card.position === 'left') {
          rotation = -90
          translate3dX = 0
          translate3dY = -windowWidth / 2 - cardHeight * scale
        }

        setTransform({ card, cardNode, rotation, translate3dX, translate3dY, scale, index })
        cardNode.style.setProperty('z-index', 100)
      }
    },

    calculateScale() {
      console.log('calculateScale :: triggered')
      this.game.started = true

      this.window.width = window.innerWidth
      this.window.height = window.innerHeight
      this.scale = Math.min(this.window.width, 1400) / 2048
      this.scaleY = this.window.height / 1080
      this.window.lo = this.window.width > 1400 ? (this.window.width - 1400) / 2 : 0;
      this.adjustCardsPositions()
    },

    removeTransitionDelays() {
      const allCards = [...this.cards, ...this.othersCards]
      for (let index = 0; index < allCards.length; index++) {
        const card = allCards[index];
        const cardNode = document.getElementById(card.id)

        if (cardNode?.style.transitionDelay) {
          cardNode.style.removeProperty('transition-delay')
        }
      }
    },

    onGameScreenEnter() {
      window.addEventListener('resize', this.calculateScale)
    },

    async onGameStarted() {
      console.log('onGameStarted :: triggered')

      await this.$nextTick()

      const cards = this.$refs.gameRegion?.querySelectorAll('.poker-card') ?? []
      for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        card.style.setProperty('transform', `${getComputedStyle(card).getPropertyValue('transform')} translate3d(-${index / 4 + 1}px, ${index / 4 + 1}px, 0px)`)
      }

      await sleep(2000)

      this.cards = this.cards.map(card => ({
        ...card,
        status: 'indeck',
      }))

      this.othersCards = this.othersCards.map(card => ({
        ...card,
        status: 'indeck',
      }))

      this.animatingIntro = false

      await this.$nextTick()
      this.calculateScale()
      await this.$nextTick()
      this.removeTransitionDelays()
    },

    setPlayerCards(_cards) {
      let cards = this.calculateCardsValue(_cards)
      cards = _.sortBy(cards, [
        function (o) {
          return cardTypeSortOrder[o.type]
        }, function (o) {
          return o.cmp
        }
      ]);

      if (!this.game.started) {
        this.onGameStarted()
      }

      this.cards = cards
    },

    setOthersCards(_othersCards) {
      let othersCards = _othersCards.filter(card => this.user.id !== card.owner.id)
      this.othersCards = this.calculateCardsPositions(othersCards)
    },

    setDeskCards(_deskCards) {
      console.log('setDeskCards :: triggered')

      let deskCards = _deskCards.map(item => ({
        card: this.calculateCardsValue([item.card]).at(0),
        user: item.user
      }))
      this.desk = deskCards
    },

    socket_roomStarted() {
      this.runTimer(10)
    },

    socket_gameStarted(trump) {
      this.game.trump = trump
      this.game.realStarted = true
      this.selectTrumpStage = false
      this.selectLeftoverStage = false

      this.killTimer()
    },

    socket_selectTrump() {
      this.selectTrumpStage = true
      this.selectLeftoverStage = false

      this.runTimer(10)
    },

    socket_selectLeftover() {
      this.selectTrumpStage = false
      this.selectLeftoverStage = true

      this.runTimer(20)
    },

    socket_cardToDesk(deskCard) {
      console.log('socket_cardToDesk :: triggered')

      const userId = deskCard.user.id
      const card = deskCard.card

      console.log('socket_cardToDesk :: card', card)

      if (userId === this.user.id) return

      const userIndex = this.playerSeatOrder.findIndex(user => user === userId)
      const userPosition = playerPositions[userIndex]
      const cardNode = document.getElementById(card.id)
      let rotation = getRandomInt(-10, 10)

      if (userPosition === 'left') rotation += 90
      else if (userPosition === 'right') rotation -= 90
      else if (userPosition === 'top') rotation += 180

      // TODO:
      cardNode.style.setProperty('transform', `rotate(${rotation}deg) translate3d(${-30 * this.scale}px, ${160 * this.scale}px, 0px) rotate(0deg) rotateY(0deg) scale(${this.scale}) rotateY(360deg)`)
      cardNode.style.setProperty('z-index', 100 + this.cardsOnDesk.length)

      // update card
      this.othersCards = this.othersCards.map(item => {
        if (item.id !== card.id) return item

        return {
          ...item,
          status: 'indesk',
          type: card.type,
          number: card.number,
        }
      })
    },

    async socket_roundWinner(roundWinner) {
      console.log('socket_roundWinner :: triggered')

      const roundWinnerId = roundWinner.id
      const winnerIndex = this.playerSeatOrder.findIndex(user => user === roundWinnerId)
      const winnerPosition = playerPositions[winnerIndex]

      const cardIds = this.cardsOnDesk.map(card => card.id)
      console.log('socket_roundWinner :: cardIds', cardIds)

      const mapCardFn = item => {
        if (!cardIds.includes(item.id)) return item

        return {
          ...item,
          status: 'inwaste',
          position: winnerPosition
        }
      }

      // TODO:

      await sleep(1000)

      this.cards = this.cards.map(mapCardFn)
      this.othersCards = this.othersCards.map(mapCardFn)

      // remove cards from dom
      // this.cards = this.cards.filter(item => item.status !== 'indesk')
      // this.othersCards = this.othersCards.filter(item => item.status !== 'indesk')
    },

    calculateCardsValue(cards) {
      return cards.map(card => ({
        cmp: cardSortOrder[card.number] ?? parseInt(card.number),
        status: this.game.started ? 'indeck' : 'initial',
        ...card
      }))
    },

    calculateCardsPositions(cards) {
      return cards.map(card => ({
        status: this.game.started ? 'indeck' : 'initial',
        position: playerPositions[app.playerSeatOrder.findIndex(id => id === card.owner?.id) ?? 10],
        ...card
      }))
    },

    runTimer(s) {
      console.log('runTimer :: triggered', s)

      this.killTimer()

      this.$nextTick()
      this.timerRunning = true
      this.$nextTick()

      this.timerPid = gsap.fromTo('#timer .bar', {
        width: '100%'
      }, {
        width: 0,
        duration: s,
        ease: "none",
        onComplete: () => {
          this.timerRunning = false
        }
      })
    },

    killTimer() {
      if (this.timerPid) this.timerPid.kill()
    }
  },
  watch: {
    user: {
      handler(newUser, oldUser) {
        sessionStorage.setItem('user', JSON.stringify(newUser))
      },
      deep: true
    },
    game: {
      handler(_new, _old) {
        sessionStorage.setItem('gameId', _new.id)
      },
      deep: true
    },
  },
  computed: {
    isOwner() {
      return this.game.owner.id === this.user.id
    },

    players() {
      const users = this.playerSeatOrder.map((userId, index) => {
        const user = this.users.find(user => user.id === userId)
        return user ? {
          ...user,
          position: playerPositions[index],
        } : {}
      })
      const filteredUsers = users.filter(user => !!user)
      return filteredUsers
    },

    allCards() {
      return [...this.cards, ...this.othersCards]
    },

    cardsOnDesk() {
      return this.allCards.filter(item => item.status === 'indesk')
    },

    cardsInWaste() {
      return this.allCards.filter(item => item.status === 'inwaste')
    },

    myCardsOnDeck() {
      return this.cards.filter(item => item.status === 'indeck')
    },

    otherCardsOnDeck() {
      return this.othersCards.filter(item => item.status === 'indeck')
    },

    othersCardsTop() {
      return this.otherCardsOnDeck.filter(item => item.position === 'top')
    },

    othersCardsLeft() {
      return this.otherCardsOnDeck.filter(item => item.position === 'left')
    },

    othersCardsRight() {
      return this.otherCardsOnDeck.filter(item => item.position === 'right')
    },
  },
  data() {
    return {
      getRandomInt,
      game: {
        id: '',
        status: 'waiting',
        stage: 'created',
        started: false,
        realStarted: false,
        trump: '',
        winner: {},
        owner: {}
      },
      user: {
        id: '',
        name: '',
        bid: 0,
        score: 0,
      },
      scale: 0.5,
      scaleY: 0.5,
      playerSeatOrder: [],
      stage: 'create-game',
      users: [],
      cards: [],
      othersCards: [],
      // cards: mockCards,
      // othersCards: mockOthersCards,
      desk: [],
      bidded: false,
      selectTrumpStage: false,
      selectLeftoverStage: false,
      leftovers: [],
      myturn: false,
      animatingIntro: true,
      animatingWinner: false,
      timerRunning: false,
      timerPid: 0,
      turn: {
        id: '',
        name: ''
      },
      window: {
        width: 0,
        height: 0,
        lo: 0,
      }
    }
  },
  mounted() {
    const user = JSON.parse(sessionStorage.getItem('user'))
    this.user.id = user && user.id ? user.id : generateUUID()
    this.user.name = user && user.name ? user.name : ''

    const handler = async (_new, _old) => {
      console.log('cards watcher: _new', _new)
      if (!this.game.started) return
      console.log('cards watcher:', this.game.started)
      await this.$nextTick()
      this.adjustCardsPositions()
    }

    const throttled = _.throttle(handler, 100)
    this.$watch('cards', throttled, { deep: true })
    this.$watch('otherCardsOnDeck', throttled, { deep: true })

    const gameId = sessionStorage.getItem('gameId')
    if (gameId && false) {
      this.game.id = gameId
      const interval = setInterval(() => {
        try {
          this.joinGame()
          clearInterval(interval)
        } catch (e) { }
      }, 200)
    }
  }
}).mount('#app')

function sortPlayers(users) {
  let _users = []

  let index = users.findIndex(user => user.id === app.user.id);
  const me = users[index]

  _users.push(me.id)
  _users.push(...[...users.slice(index + 1)].map(user => user.id))
  _users.push(...[...users.slice(0, index)].map(user => user.id))

  return _users
}

socket.addEventListener('message', function (message) {
  message = JSON.parse(message.data)

  switch (message.type) {
    case 'gameId':
    case 'joined':
      app.stage = 'game'
      app.game.id = message.message
      app.onGameScreenEnter()
      break;

    case 'gameNotFound':
      app.game.id = ''
      break;

    case 'gameDetails':
      app.stage = 'game'
      const gameDetails = JSON.parse(message.message)
      app.game.stage = gameDetails.Stage
      app.game.owner = gameDetails.Owner
      app.game.desk = gameDetails.Desk
      app.game.trump = gameDetails.Trump
      break;

    case 'userJoined':
      let userJoined = [...app.users]
      userJoined.push(JSON.parse(message.message))
      userJoined = [...new Set(userJoined.map(obj => obj.id))].map(id => userJoined.find(item => item.id === id))
      app.users = userJoined
      app.playerSeatOrder = sortPlayers(userJoined)
      break;

    case 'userList':
      const userList = JSON.parse(message.message)
      app.users = userList
      app.playerSeatOrder = sortPlayers(userList)
      break;

    case 'userBids':
      const userBids = JSON.parse(message.message)
      Object.keys(userBids).forEach(userId => {
        const user = app.users.findIndex(item => item.id === userId)
        if (user > -1) app.users[user].bid = userBids[userId]
      });
      break;

    case 'desk':
      let deskCards = JSON.parse(message.message)
      app.setDeskCards(deskCards)
      break;

    case 'cards':
      let cards = JSON.parse(message.message)
      app.setPlayerCards(cards)
      break;

    case 'othersCards':
      let othersCards = JSON.parse(message.message)
      app.setOthersCards(othersCards)
      break;

    case 'gameStarted':
      const trump = message.message
      app.socket_gameStarted(trump)
      break;

    case 'selectTrump':
      app.socket_selectTrump()
      break;

    case 'selectLeftover':
      app.socket_selectLeftover()
      break;

    case 'turn':
      const user = JSON.parse(message.message)
      app.myturn = app.user.id == user.id
      app.turn = user
      break;

    case 'winner':
      app.game.winner = JSON.parse(message.message)
      break;

    case 'trump':
      app.game.trump = message.message
      break;

    case 'score':
      app.user.score = parseInt(message.message)
      break;

    case 'stage':
      const stage = message.message
      app.game.stage = stage
      break;

    case 'cardToDesk':
      const deskCard = JSON.parse(message.message)
      app.socket_cardToDesk(deskCard)
      break;

    case 'roundWinner':
      const roundWinner = JSON.parse(message.message)
      app.socket_roundWinner(roundWinner)
      break;

    case 'roomStarted':
      app.socket_roomStarted()
      break;

    default:
      break;
  }
})
