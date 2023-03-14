const { createApp } = Vue
const host = window.location.hostname
const socket = new WebSocket(`ws://${host}:3000/ws`)

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

      if (this.game.stage === 'leftover') {
        this.leftovers.push(card)
        this.cards = this.cards.filter(item => item !== card)

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


      const box = e.target
      var rect = box.getBoundingClientRect();

      var fragment = document.createDocumentFragment()
      fragment.appendChild(box)
      document.querySelector('.desk').appendChild(fragment)

      var newRect = box.getBoundingClientRect();

      TweenMax.set(box, { x: 0, y: 0, width: box.width });

      TweenMax.from(box, 1, {
        x: rect.left - newRect.left,
        y: rect.top - newRect.top,
        width: rect.width,
        ease: Power3.easeOut
      });

      socket.send(JSON.stringify({
        type: 'sendCard',
        userid: this.user.id,
        username: this.user.name,
        message: JSON.stringify(card)
      }))
      this.cards = this.cards.filter(item => item !== card)
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
    }
  },
  computed: {
    isOwner() {
      return this.game.owner.id === this.user.id
    }
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
      playerSeatOrder: [],
      stage: 'create-game',
      users: [],
      cards: [],
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
      }
    }
  },
  mounted() {
    const user = JSON.parse(sessionStorage.getItem('user'))
    this.user.id = user && user.id ? user.id : generateUUID()
    this.user.name = user && user.name ? user.name : ''

    const gameId = sessionStorage.getItem('gameId')
    if (gameId) {
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
    ...card
  }))
}

socket.addEventListener('message', function (message) {
  message = JSON.parse(message.data)

  // console.log('message', message)

  const windowWidth = window.outerWidth
  const windowHeight = window.outerHeight
  const desk = document.querySelector('.desk')

  switch (message.type) {
    case 'gameId':
    case 'joined':
      app.stage = 'game'
      app.game.id = message.message
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

      const newCard = document.createElement('img')
      newCard.src = '/assets/cards/' + deskCard.card.type + deskCard.card.number + '.png'
      desk.appendChild(newCard)

      var rect = newCard.getBoundingClientRect();
      TweenMax.set(newCard, { x: 0, y: 0 });

      switch (userIndex) {
        case 0:
          // from bottom

          TweenMax.from(newCard, 1, {
            x: rect.left,
            y: windowHeight,
            ease: Power3.easeOut
          });

          break;

        case 1:
          // from right

          TweenMax.from(newCard, 1, {
            x: windowWidth,
            y: (windowHeight / 2) - rect.height,
            ease: Power3.easeOut
          });

          break;

        case 2:
          // from left

          TweenMax.from(newCard, 1, {
            x: -rect.width - windowWidth,
            y: (windowHeight / 2) - rect.height,
            ease: Power3.easeOut
          });

          break;

        default:
          console.log('cardToDesk::userIndex', userIndex)
          console.log('cardToDesk::userId', userId)
          console.log('cardToDesk::app.playerSeatOrder', app.playerSeatOrder)
          break;
      }
      break;

    case 'roundWinner':
      app.animatingWinner = true
      const roundWinner = JSON.parse(message.message)
      desk.classList.add('roundOver')

      const roundWinnerId = roundWinner.id
      const winnerIndex = app.playerSeatOrder.findIndex(user => user === roundWinnerId)

      var deskRect = desk.getBoundingClientRect();

      setTimeout(() => {
        const fakeWrapper = document.createElement('div')
        fakeWrapper.classList.add('fakeWrapper')
        fakeWrapper.style.position = 'absolute'
        fakeWrapper.style.top = deskRect.top
        fakeWrapper.style.left = deskRect.left
        const fragment = document.createDocumentFragment()
        for (var i = 0; i < desk.children.length; i++) {
          const childrenClone = desk.children[i].cloneNode(true)
          childrenClone.style.removeProperty('transform')
          childrenClone.style.removeProperty('width')
          fragment.appendChild(childrenClone)
        }
        fakeWrapper.appendChild(fragment)
        document.getElementById('game').appendChild(fakeWrapper)

        while (desk.hasChildNodes()) {
          desk.removeChild(desk.firstChild);
        }

        var rect = fakeWrapper.getBoundingClientRect();

        gsap.to(fakeWrapper, { paddingLeft: 120, duration: 0.5 })
        fakeWrapper.childNodes.forEach(node => {
          gsap.to(node, { marginLeft: -120, duration: 1 })
        })

        setTimeout(() => {
          switch (winnerIndex) {
            case 0:
              // to bottom
              gsap.to(fakeWrapper, { y: windowHeight * 2, duration: 2 });
              break;

            case 1:
              // to right
              gsap.to(fakeWrapper, { x: windowWidth * 2, duration: 2 });
              break;

            case 2:
              // to left
              gsap.to(fakeWrapper, { x: -windowWidth * 2, duration: 2 });
              break;

            default:
              console.log('cardToDesk::winnerIndex', winnerIndex)
              break;
          }

          setTimeout(() => {
            desk.classList.remove('roundOver')
            fakeWrapper.remove()
            app.animatingWinner = false
          }, 2000)
        }, 2000)
      }, 1000)
      break;

    default:
      break;
  }
})

setInterval(() => {
  const cards = document.querySelectorAll('.cards .card')
  const length = cards.length

  cards.forEach((card, index) => {
    if (card.matches('.roundOver')) return

    const i = index >= (length / 2) ? index - (length / 2) + 1 : (length / 2) - index + 1;
    const m = index >= (length / 2) ? 1 : -1;

    let transform = ''

    const y = -100 + i * i
    transform = `${transform} translate3d(0, ${y}px, 0px)`
    transform = `${transform} rotateZ(${m * i * 1.55}deg)`
    transform = `${transform} translateY(100px)`

    card.style.transform = transform;

    transform = `${transform} translateY(-5px)`

    if (card.matches(':not(.disabled):hover')) {
      card.style.transform = transform;
    }
  });
}, 200)