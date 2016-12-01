import 'plugins/meter_vis/meter_vis_controller';

import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import meterVisTemplate from 'plugins/meter_vis/meter_vis.html';
import VisSchemasProvider from 'ui/vis/schemas';

import meterVisParamsTemplate from 'plugins/meter_vis/meter_vis_params.html';

require('ui/registry/vis_types').register(MeterVisProvider);

function MeterVisProvider(Private) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  return new TemplateVisType({
    name: 'meter',
    title: 'Meter',
    icon: 'fa-calculator',
    description: 'Metric with ranges',
    template: meterVisTemplate,
    params: {
      defaults: {
        ranges: [{
          from: 0,
          to: 100,
          color: '#8fec00'
        }]
      },
      editor: meterVisParamsTemplate
    },
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Metric',
        min: 1,
        max: 1,
        defaults: [
          { type: 'count', schema: 'metric' }
        ]
      }
    ])
  });
}

export default MeterVisProvider;
