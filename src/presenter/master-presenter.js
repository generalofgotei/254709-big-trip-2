import BigTripPresenter from './big-trip-presenter.js';
import WaypointPresenter from './waypoint-presenter.js';
import SortListPresenter from './sort-presenter.js';
import NewWaypointPresenter from './new-waypoint-presenter.js';
import WaypointEmptyView from '../view/waypoint-empty-view/waypoint-empty-view.js';

import { getSortbyDefault, getSortbyTime, getSortbyPrice } from '../utils/sort.js';
import { UserAction, UpdateType, SortType, EventsMsg, FilterAction } from '../const.js';
import FilterPresenter from './filter-presenter.js';
import { render } from '../framework/render.js';

export default class MasterPresenter {
  #tripMainContainer = null;
  #tripEventsContainer = null;
  #waypointEmptyComponent = null;

  #waypointsModel = null;
  #offersModel = null;
  #destinationsModel = null;

  #bigTripPresenter = null;
  #filterPresenter = null;
  #sortPresenter = null;
  #newWaypointsPresenter = null;
  #waypointPresenters = new Map();


  #currentSortType = SortType.DEFAULT;

  constructor({
    tripMainContainer,
    tripEventsContainer,
    waypointsModel,
    offersModel,
    destinationsModel,
    filterPresenter,
  }) {
    this.#tripMainContainer = tripMainContainer;
    this.#tripEventsContainer = tripEventsContainer;

    this.#waypointsModel = waypointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#filterPresenter = filterPresenter;
    this.#waypointsModel.addObserver(this.#handleModelEvent);
  }

  get waypoints() {
    switch(this.#currentSortType) {
      case SortType.DAY.NAME:
        return [...this.#waypointsModel.waypoints].sort(getSortbyDefault);
      case SortType.TIME.NAME:
        return [...this.#waypointsModel.waypoints].sort(getSortbyTime);
      case SortType.PRICE.NAME:
        return [...this.#waypointsModel.waypoints].sort(getSortbyPrice);
    }
    return this.#waypointsModel.waypoints;
  }

  init() {
    this.#runApp();
  }

  #runApp = () => {
    this.#initBigTripPresenter();
    this.#filterPresenter.addCallback(this.#handleFilterChange);
    this.#filterPresenter.addModel(this.#waypointsModel);
    this.#updateWaypointsUI();
    this.#initNewWaypointsPresenter();
  };

  #initBigTripPresenter = () => {
    this.#bigTripPresenter = new BigTripPresenter({
      tripInfoContainer: this.#tripMainContainer,
      listContainer: this.#tripEventsContainer
    });

    this.#bigTripPresenter.init();
  };

  #initSortPresenter = () => {
    this.#sortPresenter = new SortListPresenter({
      listContainer: this.#tripEventsContainer,
      onSortTypeChange: this.#handleSortChange,
    });
    this.#sortPresenter.init();
  };

  #initNewWaypointsPresenter = () => {
    this.#newWaypointsPresenter = new NewWaypointPresenter({
      listContainer: this.#tripEventsContainer,
      offersModel: this.#offersModel,
      destinationsModel: this.#destinationsModel,
      onDataChange: this.#handleViewAction,
      sortPresenter: this.#sortPresenter,
      filterPresenter: this.#filterPresenter,
    });
    this.#newWaypointsPresenter.init();
  };

  #updateWaypointsUI = () => {
    if (this.#waypointEmptyComponent) {
      this.#waypointEmptyComponent.destroy();
      this.#waypointEmptyComponent = null;
    }
    if (!this.#sortPresenter) {
      this.#initSortPresenter();
    }

    const currentFilter = this.#filterPresenter.getCurrentFilter();
    if (this.waypoints.length === 0) {
      this.#sortPresenter.destroy();
      this.#sortPresenter = null;
      this.#waypointEmptyComponent = new WaypointEmptyView(EventsMsg[`${currentFilter.toUpperCase()}`]);
      render(this.#waypointEmptyComponent, this.#tripEventsContainer);
    }
    this.waypoints.forEach((waypoint) => {
      this.#renderWaypoint(waypoint);
    });
  };

  #renderWaypoint = (waypoint) => {
    const waypointPresenter = new WaypointPresenter({
      listContainer: this.#tripEventsContainer,
      offersModel: this.#offersModel,
      destinationsModel: this.#destinationsModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
      newWaypointPresenter: this.#newWaypointsPresenter
    });

    waypointPresenter.init(waypoint);
    this.#waypointPresenters.set(waypoint.id, waypointPresenter);
  };

  #handleFilterChange = (filterAction, filterType) => {
    switch (filterAction) {
      case FilterAction.SET_FILTER:
        if (filterType === 'everything') {
          this.#waypointsModel.resetToOriginal(UpdateType.VIEW_CHANGE);
        } else {
          const filteredWaypoints = this.#filterPresenter.getFilteredWaypoints(filterType.toUpperCase());
          this.#waypointsModel.setWaypoints(UpdateType.VIEW_CHANGE, filteredWaypoints);
        }
        break;
      case FilterAction.RESET_FILTER:
        this.#waypointsModel.resetToOriginal(UpdateType.VIEW_CHANGE);
        break;
    }
  };

  // Меняем модель тут, получая данные из waypoint-presenter. После изменения данных срабатывает handleModelEvent
  #handleViewAction = (userAction, updateType, updatedWaypoint) => {
    switch (userAction) {
      case UserAction.UPDATE_WAYPOINT:
        this.#waypointsModel.updateWaypoint(updateType, updatedWaypoint);
        break;
      case UserAction.ADD_WAYPOINT:
        this.#waypointsModel.addWaypoint(updateType, updatedWaypoint);
        break;
      case UserAction.DELETE_WAYPOINT:
        this.#waypointsModel.deleteWaypoint(updateType, updatedWaypoint);
        break;
    }
  };

  // Дергается при изменении модели
  #handleModelEvent = (updateType, updatedWaypoint) => {
    switch (updateType) {
      case UpdateType.PATCH: {
        this.#waypointPresenters.get(updatedWaypoint.id).init(updatedWaypoint);
        break;
      }
      case UpdateType.VIEW_CHANGE: {
        const currentFilter = this.#filterPresenter.getCurrentFilter();
        if (currentFilter !== 'everything') {
          const filteredWaypoints = this.#filterPresenter.getFilteredWaypoints(currentFilter.toUpperCase());

          this.#waypointsModel.setFilteredWaypoints(filteredWaypoints);
        }
        this.#reload();
        break;
      }
      case UpdateType.RESET_ALL: {
        this.#filterPresenter.resetFilter();
        this.#sortPresenter.resetSortType();
        this.#reload();
        break;
      }
    }
  };

  #handleSortChange = (dataset) => {
    this.#currentSortType = dataset.sortType;
    this.#reload();
  };

  #reload = () => {
    this.destroyPresenters();
    this.#updateWaypointsUI();
  };

  #handleModeChange = () => {
    this.#waypointPresenters.forEach((presenter) => presenter.resetView());
  };

  destroyPresenters() {
    this.#waypointPresenters.forEach((presenter) => presenter.clear());
  }
}
