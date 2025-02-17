import AbstractView from '../../framework/view/abstract-view.js';
import { humanizeTaskDueDate, humanizeTaskDueTime, getDuration } from '../../util.js';
import { waypointItemTemplate } from './waypoint-item-view-template.js';

const createWaypointItemTemplate = (waypoint, offers, destination) => {
  const { basePrice, type, favorite, dateFrom, dateTo } = waypoint;
  const { name } = destination;

  return waypointItemTemplate({
    dateFrom,
    dateTo,
    type,
    name,
    basePrice,
    favorite,
    offers,
    humanizeTaskDueDate,
    humanizeTaskDueTime,
    getDuration
  });
};

export default class WaypointContentView extends AbstractView {
  #waypoint = null;
  #offers = null;
  #destination = null;
  #onEditClick = null;

  constructor({ waypoint, offers, destination, onEditClick }) {
    super();
    this.#waypoint = waypoint;
    this.#offers = offers;
    this.#destination = destination;
    this.#onEditClick = onEditClick;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editClickHandler);
  }


  get template() {
    return createWaypointItemTemplate(this.#waypoint, this.#offers, this.#destination);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#onEditClick();
  };
}
