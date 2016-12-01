export default function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/meter_vis/meter_vis'
      ]
    }
  });
};
