import Reel from './Reel.js';
import Symbol from './Symbol.js';
import createClient from './busy-sdk/createClient';

const client = createClient(window.parent, ['http://localhost:3000']);
let id = 0;

export default class Slot {
  constructor(domElement, config = {}) {
    Symbol.preload();

    this.currentSymbols = [
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
    ];

    this.nextSymbols = [
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
      ['death_star', 'death_star', 'death_star'],
    ];

    this.container = domElement;

    this.reels = Array.from(this.container.getElementsByClassName('reel')).map(
      (reelContainer, idx) => new Reel(reelContainer, idx, this.currentSymbols[idx]),
    );

    this.spinButton = document.getElementById('spin');
    this.spinButton.addEventListener('click', () => this.spin());

    this.autoPlayCheckbox = document.getElementById('autoplay');

    if (config.inverted) {
      this.container.classList.add('inverted');
    }

    this.handleIntro();
  }

  handleIntro() {
    client
      .call(id, 'get_current_user', [])
      .then(user => {
        document.getElementById('answers-header').innerHTML = !!user ? user.displayName : '';
      })
      .catch(err => {
        document.getElementById('jp').append('Error getting user');
      });
    id += 1;
  }

  spin() {
    this.handleRefreshClick();
    this.onSpinStart();

    this.currentSymbols = this.nextSymbols;
    this.nextSymbols = [
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
      [Symbol.random(), Symbol.random(), Symbol.random()],
    ];

    return Promise.all(
      this.reels.map(reel => {
        reel.renderSymbols(this.currentSymbols[reel.idx], this.nextSymbols[reel.idx]);
        return reel.spin();
      }),
    ).then(() => this.onSpinEnd());
  }

  onSpinStart() {
    this.spinButton.disabled = true;

    console.log('SPIN START!');
  }

  onSpinEnd() {
    this.spinButton.disabled = false;

    console.log('SPIN END');

    if (this.autoPlayCheckbox.checked) return window.setTimeout(() => this.spin(), 200);
  }
}
