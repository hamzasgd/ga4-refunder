import 'the-new-css-reset/css/reset.css';
import '../scss/styles.scss';
import samplePayload from './modules/samplePayload';
import processRefund from './modules/processRefund';

// Process Refund Request
processRefund();

// Fill form with sample data
window.samplePayload = samplePayload;
