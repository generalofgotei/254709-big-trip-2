import { getRandomWaypoint } from '../mocks/waypoints.js';


const WAYPOINT_QTY = 12;

export default class WaypointsModel {
  #waypoints = Array.from({ length: WAYPOINT_QTY }, getRandomWaypoint);

  get waypoints() {
    return this.#waypoints;
  }
}
