// make requests specific to a collection
import ApiConnectionManager from './ApiConnectionManager';

class CollectionManager {
  constructor(username, uri) {
    this.acm = new ApiConnectionManager();
    this.username = username;
    this.uri = uri;
  }
  
  getCollectionPhotos() {
    return this.acm.request(`/collection/${this.username}/${this.uri}`);
  }
}

export default CollectionManager;
