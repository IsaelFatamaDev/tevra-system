import api from '../../../core/services/api';

export const shipmentsService = {
  trackByNumber: (trackingNumber) => {
    return api.get(`/shipments/track/${encodeURIComponent(trackingNumber)}`);
  },
};

export default shipmentsService;
