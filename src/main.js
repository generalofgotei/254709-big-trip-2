import WaypointsApiService from './api/waypoints-api-service.js';
import WaypointsModel from './model/waypoints-model.js';
import OffersModel from './model/offers-model.js';
import DestinationsModel from './model/destinations-model.js';
import MasterPresenter from './presenter/master-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import WaypointEmptyView from './view/waypoint-empty-view/waypoint-empty-view.js';
import { END_POINT, AUTHORIZATION, EventMsg } from './const.js';
import { render } from './framework/render.js';
import 'flatpickr/dist/flatpickr.min.css';

const tripMainContainer = document.querySelector('.trip-main');
const filtersListContainer = tripMainContainer.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');
const newWaypointBtn = document.querySelector('.trip-main__event-add-btn');

const waypointsApiService = new WaypointsApiService(END_POINT, AUTHORIZATION);

const waypointsModel = new WaypointsModel({ waypointsApiService });
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();

const filterPresenter = new FilterPresenter({
  filtersListContainer,
  waypointsModel,
  onFilterChange: null,
});

const masterPresenter = new MasterPresenter({
  tripMainContainer,
  tripEventsContainer,
  waypointsModel,
  offersModel,
  destinationsModel,
  filterPresenter,
});

const getModelsByServer = async () => {
  const destinations = await waypointsApiService.destinations;
  const offers = await waypointsApiService.offers;
  const waypoints = await waypointsApiService.waypoints;
  destinationsModel.init(destinations);
  offersModel.init(offers);
  waypointsModel.init(waypoints);
};

const runApp = async () => {
  try {
    newWaypointBtn.setAttribute('disabled', '');

    const loadingMsgComponent = new WaypointEmptyView(EventMsg.LOADING);
    render(loadingMsgComponent, tripEventsContainer);

    await getModelsByServer();

    loadingMsgComponent.destroy();
    newWaypointBtn.removeAttribute('disabled', '');

    filterPresenter.init();
    masterPresenter.init();

  } catch(error) {
    tripEventsContainer.innerHTML = '';
    newWaypointBtn.setAttribute('disabled', '');
    const errorMsgComponent = new WaypointEmptyView(EventMsg.ERROR);
    render(errorMsgComponent, tripEventsContainer);
  }
};

runApp();
