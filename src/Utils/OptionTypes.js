export default function getOptionTypes(optionType) {
  switch (optionType.toUpperCase()) {
    case 'YENONA':
      return [{value: 'Yes', color: '#26A69A'}, {value: 'No', color: '#EF5350'}, {value: 'NA', color: '#FFCA28'}];
    case 'CNCONA':
      return [
        {value: 'Conform', color: '#26A69A'},
        {value: 'Non-Conformance', color: '#EF5350'},
        {value: 'Observations', color: '#FFCA28'},
        {value: 'NA', color: '#26C6DA'},
      ];
    case 'CMMCA':
      return [
        {value: 'Compliant', color: '#26A69A'},
        {value: 'Major', color: '#EF5350'},
        {value: 'Minor', color: '#FFCA28'},
        {value: 'Critical', color: '#26C6DA'},
        {value: 'NA', color: '#7E57C2'},
      ];
    case 'CNONC':
      return [{value: 'Compliant', color: '#26A69A'}, {value: 'Noncompliant', color: '#EF5350'}];
    case 'DATE':
      return [{value: 'date', color: '#26A69A'}];
    case 'NUM':
      return [{value: 'Number', color: '#26A69A'}];
    case 'PAFA':
      return [{value: 'Pass', color: '#26A69A'}, {value: 'Fail', color: '#EF5350'}];
    case 'TEXT':
      return [{value: 'Text', color: '#26A69A'}];
    case 'YENO':
      return [{value: 'Yes', color: '#26A69A'}, {value: 'No', color: '#EF5350'}];
    case '1TO5':
      return [
        {value: '1', color: '#26A69A'},
        {value: '2', color: '#EF5350'},
        {value: '3', color: '#FFCA28'},
        {value: '4', color: '#26C6DA'},
        {value: '5', color: '#7E57C2'},
      ];
    case 'MERABS':
      return [
        {value: 'Meets Expectation', color: '#26A69A'},
        {value: 'Requires Attention', color: '#EF5350'},
        {value: 'Below Standard', color: '#FFCA28'},
        {value: 'NA', color: '#26C6DA'},
      ];
    case 'CODEMI':
      return [
        {value: 'Contractor', color: '#26A69A'},
        {value: 'Directly Employed', color: '#EF5350'},
        {value: 'Mixed', color: '#FFCA28'},
      ];

    case 'HIMELO':
      return [{value: 'High', color: '#26A69A'}, {value: 'Medium', color: '#EF5350'}, {value: 'Low', color: '#FFCA28'}];

    case 'SAARNA':
      return [{value: 'Safe', color: '#26A69A'}, {value: 'At Risk', color: '#EF5350'}, {value: 'NA', color: '#FFCA28'}];

    default:
      return [{value: 'Yes', color: '#26A69A'}, {value: 'No', color: '#EF5350'}, {value: 'NA', color: '#FFCA28'}];
  }
}
