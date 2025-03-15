import ApiService from './framework/api-service';
import { Method } from './const';

export default class WaypointsApiService extends ApiService {
  get waypoints() {
    return this._load({url: 'points'})
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({url: 'destinations'})
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({url: 'offers'})
      .then(ApiService.parseResponse);
  }

  async updateWaypoint(waypoint) {
    const response = await this._load({
      url: `points/${waypoint.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(waypoint)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  }

  #adaptToServer(waypoint) {
    const adaptedWaypoint = {
      ...waypoint,
      'base_price': +waypoint['basePrice'],
      'date_from': waypoint['dateFrom'],
      'date_to': waypoint['dateTo'],
      'is_favorite': waypoint['isFavorite'] || false,
      offers: waypoint.offersId || [],
    };

    delete adaptedWaypoint['basePrice'];
    delete adaptedWaypoint['dateFrom'];
    delete adaptedWaypoint['dateTo'];
    delete adaptedWaypoint['isFavorite'];
    delete adaptedWaypoint['offersId'];

    return adaptedWaypoint;
  }

}
