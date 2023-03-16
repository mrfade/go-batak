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

const mockOtherCards = [
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
      console.log('card:', card)
      console.log('game.stage:', this.game.stage)

      const cardNode = e.target.parentNode

      if (this.game.stage === 'leftover') {
        this.leftovers.push(card)
        cardNode.classList.add('leftover')

        const cardIndex = this.cards.findIndex(item => item === card)
        this.cards[cardIndex].status = 'leftover'

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

      // if (!this.myturn) return
      // if (this.isDisabledCard(card)) return

      // TODO:
      cardNode.classList.remove('indeck')
      cardNode.style.setProperty('transform', `rotate(${getRandomInt(-10, 10)}deg) translate3d(-19.2563px, 124.66px, 0px) rotate(0deg) rotateY(0deg) scale(${this.scale}) rotateY(360deg)`)

      // socket.send(JSON.stringify({
      //   type: 'sendCard',
      //   userid: this.user.id,
      //   username: this.user.name,
      //   message: JSON.stringify(card)
      // }))
      // this.cards = this.cards.filter(item => item !== card)

      const cardIndex = this.cards.findIndex(item => item === card)
      this.cards[cardIndex].status = 'indesk'
    },

    isDisabledCard(card) {
      let _r = null
      if (!this.myturn) _r = true
      if (this.animatingWinner) _r = true
      if (this.selectLeftoverStage) _r = false
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
      console.log('adjustCardsPositions :: ')

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

      const setTransform = (node, rotate, translate3dX, translate3dY, scale, index) => {
        let transform = ''
        transform = `${transform} rotate(${rotate}deg)`
        transform = `${transform} translate3d(${translate3dX}px, ${translate3dY}px, 0px)`
        transform = `${transform} rotateY(180deg)`
        transform = `${transform} scale(${scale})`

        if (node.classList.contains('initial')) {
          node.classList.remove('initial')
          node.style.setProperty('transition-delay', `${0.02 * index}s`)
        }
        node.style.setProperty('transform', transform)
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
          console.log('cardNode not found', card.id)
          continue
        }

        let rotation = rotations[index]
        let translate3dX = translate3dXs[index]
        let translate3dY = windowHeight / 2 - cardHeight * scale + 125 * scale

        let transform = ''
        transform = `${transform} rotate(${rotation}deg)`
        transform = `${transform} translate3d(${translate3dX}px, ${translate3dY}px, 0px)`
        transform = `${transform} scale(${scale})`

        if (cardNode.classList.contains('initial')) {
          cardNode.classList.remove('initial')
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
          console.log('cardNode not found', card.id)
          continue
        }

        if (cardNode?.classList.contains('leftover')) {
          let rotation = 0
          let translate3dX = leftoverTranslate3dXs[leftoverIndex++]
          let translate3dY = 0
          setTransform(cardNode, rotation, translate3dX, translate3dY, scale, index)
          cardNode.style.setProperty('z-index', index + 10)
        }
      }

      const topRotations = getRotations(this.otherCardsTop.length, -0.7)
      const topTranslate3dXs = getTranslate3dX(this.otherCardsTop.length, 0.275)

      const leftRotations = getRotations(this.otherCardsLeft.length, -0.7)
      const leftTranslate3dXs = getTranslate3dX(this.otherCardsLeft.length, 0.275)

      const rightRotations = getRotations(this.otherCardsRight.length, -0.7)
      const rightTranslate3dXs = getTranslate3dX(this.otherCardsRight.length, 0.275)

      // top
      for (let index = 0; index < this.otherCardsTop.length; index++) {
        const card = this.otherCardsTop[index];
        const cardNode = document.getElementById(card.id)

        const rotate = topRotations[index]
        const translate3dX = topTranslate3dXs[index]
        const translate3dY = -windowHeight / 2 + 125 * scale

        setTransform(cardNode, rotate, translate3dX, translate3dY, scale, index)
        cardNode.style.setProperty('z-index', this.otherCardsTop.length - index + 10)
      }

      // left
      for (let index = 0; index < this.otherCardsLeft.length; index++) {
        const card = this.otherCardsLeft[index];
        const cardNode = document.getElementById(card.id)

        const rotate = 90 - leftRotations[index]
        const translate3dX = leftTranslate3dXs[index]
        const translate3dY = windowWidth / 2 - 125 * scale

        setTransform(cardNode, rotate, translate3dX, translate3dY, scale, index)
        cardNode.style.setProperty('z-index', this.otherCardsLeft.length - index + 10)
      }

      // right
      for (let index = 0; index < this.otherCardsRight.length; index++) {
        const card = this.otherCardsRight[index];
        const cardNode = document.getElementById(card.id)

        const rotate = 90 + rightRotations[index]
        const translate3dX = rightTranslate3dXs[index]
        const translate3dY = -windowWidth / 2 + cardHeight * scale - 125 * scale

        setTransform(cardNode, rotate, translate3dX, translate3dY, scale, index)
        cardNode.style.setProperty('z-index', index + 10)
      }
    },

    calculateScale() {
      console.log('onGameStarted :: ')

      this.window.width = window.innerWidth
      this.window.height = window.innerHeight
      this.scale = Math.min(this.window.width, 1400) / 2048
      this.scaleY = this.window.height / 1080
      this.window.lo = this.window.width > 1400 ? (this.window.width - 1400) / 2 : 0;
      this.adjustCardsPositions()
    },

    removeTransitionDelays() {
      const allCards = [...this.cards, ...this.otherCards]
      for (let index = 0; index < allCards.length; index++) {
        const card = allCards[index];
        const cardNode = document.getElementById(card.id)

        if (cardNode.style.transitionDelay) {
          cardNode.style.removeProperty('transition-delay')
        }
      }
    },

    onGameScreenEnter() {
      window.addEventListener('resize', this.calculateScale)
    },

    onGameStarted() {
      console.log('onGameStarted :: ')

      setTimeout(() => {
        const cards = this.$refs.gameRegion?.querySelectorAll('.poker-card') ?? []
        for (let index = 0; index < cards.length; index++) {
          const card = cards[index];
          card.style.setProperty('transform', `${getComputedStyle(card).getPropertyValue('transform')} translate3d(-${index / 4 + 1}px, ${index / 4 + 1}px, 0px)`)
        }
      }, 500)

      console.log('this.$refs.gameRegion?', this.$refs.gameRegion)

      setTimeout(this.calculateScale, 2000)
      setTimeout(this.removeTransitionDelays, 3000)
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
    cards: {
      handler(_new, _old) {
        this.adjustCardsPositions()
      },
      deep: true
    }
  },
  computed: {
    isOwner() {
      return this.game.owner.id === this.user.id
    },

    myCardsOnDeck() {
      return this.cards.filter(item => item.status === 'indeck')
    },

    otherCardsTop() {
      return this.otherCards.filter(item => item.position === 'top')
    },

    otherCardsLeft() {
      return this.otherCards.filter(item => item.position === 'left')
    },

    otherCardsRight() {
      return this.otherCards.filter(item => item.position === 'right')
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
      otherCards: [],
      // cards: mockCards,
      // otherCards: mockOtherCards,
      desk: [],
      bidded: false,
      selectTrumpStage: false,
      selectLeftoverStage: false,
      leftovers: [],
      myturn: false,
      animatingWinner: false,
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

const cardTypeSortOrder = {
  maca: 1,
  kupa: 2,
  sinek: 3,
  karo: 4
}

const cardSortOrder = {
  A: 30,
  J: 25,
  Q: 26,
  K: 27
}

function sortPlayers(users) {
  let _users = []

  let index = users.findIndex(user => user.id === app.user.id);
  const me = users[index]

  _users.push(me.id)
  _users.push(...[...users.slice(index + 1)].map(user => user.id))
  _users.push(...[...users.slice(0, index)].map(user => user.id))

  return _users
}

function calculateCardsValue(cards) {
  return cards.map(card => ({
    cmp: cardSortOrder[card.number] ?? parseInt(card.number),
    status: 'indeck',
    position: app.playerSeatOrder.findIndex(id => id === card.owner?.id),
    ...card
  }))
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
      deskCards = deskCards.map(item => ({
        card: calculateCardsValue([item.card]).at(0),
        user: item.user
      }))
      app.desk = deskCards
      break;

    case 'cards':
      let cards = JSON.parse(message.message)
      cards = calculateCardsValue(cards)
      app.cards = _.sortBy(cards, [
        function (o) {
          return cardTypeSortOrder[o.type]
        }, function (o) {
          return o.cmp
        }
      ]);
      app.onGameStarted()
      break;

    case 'gameStarted':
      const trump = message.message
      app.game.trump = trump
      app.game.started = true
      app.selectTrumpStage = false
      app.selectLeftoverStage = false
      break;

    case 'selectTrump':
      app.selectTrumpStage = true
      app.selectLeftoverStage = false
      break;

    case 'selectLeftover':
      app.selectTrumpStage = false
      app.selectLeftoverStage = true
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
      const userId = deskCard.user.id
      if (userId === app.user.id) return
      const userIndex = app.playerSeatOrder.findIndex(user => user === userId)

      // TODO:
      break;

    case 'roundWinner':
      app.animatingWinner = true
      const roundWinner = JSON.parse(message.message)

      const roundWinnerId = roundWinner.id
      const winnerIndex = app.playerSeatOrder.findIndex(user => user === roundWinnerId)

      // TODO:
      break;

    default:
      break;
  }
})

const gameRegion = document.getElementById('game-region')
const cardWidth = 182
const scale = 0.5

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

// setTimeout(() => {
//   const cards = gameRegion.querySelectorAll('.poker-card')
//   const rotations = getRotations(13, 0.4)
//   const translate3dXs = getTranslate3dX(13, 2 / 3)

//   for (let index = 0; index < 13; index++) {
//     const card = cards[index];

//     let transform = ''
//     transform = `${transform} rotate(${rotations[index]}deg)`
//     transform = `${transform} translate3d(${translate3dXs[index]}px, 400px, 0px)`
//     transform = `${transform} scale(${scale})`

//     card.style.setProperty('transform', transform)
//     card.style.setProperty('z-index', index + 10)

//     card.addEventListener('click', () => {
//       card.style.setProperty('transform', `rotate(${getRandomInt(-10, 10)}deg) translate3d(-19.2563px, 124.66px, 0px) rotate(0deg) rotateY(0deg) scale(${scale}) rotateY(360deg)`)
//     })

//     console.log(transform)
//   }

//   const rotationsOther = getRotations(13, -0.7)
//   const translate3dXsOther = getTranslate3dX(13, 0.275)

//   for (let index = 0; index < 13; index++) {
//     const card = cards[index + 13];

//     let transform = ''
//     transform = `${transform} rotate(${rotationsOther[index]}deg)`
//     transform = `${transform} translate3d(${translate3dXsOther[index]}px, -400px, 0px)`
//     transform = `${transform} rotateY(180deg)`
//     transform = `${transform} rotateX(180deg)`
//     transform = `${transform} scale(${scale})`

//     card.style.setProperty('transform', transform)
//     card.style.setProperty('z-index', index + 10)

//     console.log(transform)
//   }

//   for (let index = 0; index < 13; index++) {
//     const card = cards[index + 26];

//     let transform = ''
//     transform = `${transform} rotate(${-90 - rotationsOther[index]}deg)`
//     transform = `${transform} translate3d(${translate3dXsOther[index]}px, 400px, 0px)`
//     transform = `${transform} rotateY(180deg)`
//     transform = `${transform} rotateX(180deg)`
//     transform = `${transform} scale(${scale})`

//     card.style.setProperty('transform', transform)
//     card.style.setProperty('z-index', index + 10)

//     console.log(transform)
//   }

//   for (let index = 0; index < 13; index++) {
//     const card = cards[index + 39];

//     let transform = ''
//     transform = `${transform} rotate(${90 - rotationsOther[index]}deg)`
//     transform = `${transform} translate3d(${translate3dXsOther[index]}px, 400px, 0px)`
//     transform = `${transform} rotateY(180deg)`
//     transform = `${transform} rotateX(180deg)`
//     transform = `${transform} scale(${scale})`

//     card.style.setProperty('transform', transform)
//     card.style.setProperty('z-index', index + 10)

//     console.log(transform)
//   }
// }, 2000)
