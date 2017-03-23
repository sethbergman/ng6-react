// http://stackoverflow.com/a/3855394/162210
const queryParams = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

const Encoder = React.createClass({
  getInitialState() {
    return {
      base: queryParams['baseId'] || '',
      table: queryParams['tableId'] || '',
      fields: [],
      filterByFormula: '',
      maxRecords: null,
      pageSize: null,
      sort: [],
      view: '',
    }
  },
  _addField() {
    const {fields} = this.state;
    fields.push('');
    this.setState({fields});
  },
  _addSort() {
    const {sort} = this.state;
    sort.push({
      field: '',
      direction: 'asc',
    });
    this.setState({sort});
  },
  _renderFields() {
    const {fields} = this.state;
    if (fields.length === 0) {
      return <div className="allFields">All fields will be included by default.</div>;
    }
    return fields.map((field, i) => {
      return (
        <label className="field">
          Field name:
          <input
            type="text"
            value={field}
            onChange={e => {
              fields[i] = e.target.value;
              this.setState({fields});
            }}
            />
          <button onClick={() => {
              fields.splice(i, 1);
              this.setState({fields});
            }}>&times;</button>
        </label>
      );
    });
  },
  _renderSorts() {
    const {sort} = this.state;
    if (sort.length === 0) {
      return null;
    }
    return sort.map((sortObj, i) => {
        return (
          <label className="sort">
            Field name:
            <input
              type="text"
              value={sortObj.field}
              onChange={e => {
                sortObj.field = e.target.value;
                this.setState({sort});
              }}
              />
            <select value={sortObj.direction} onChange={e => {
                sortObj.direction = e.target.value;
                this.setState({sort});
              }}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <button onClick={() => {
                sort.splice(i, 1);
                this.setState({sort});
              }}>&times;</button>
          </label>
         );
    });
  },
  _renderUrl() {
    const base = encodeURIComponent(this.state.base || 'YOUR_BASE_ID');
    const table = encodeURIComponent(this.state.table || 'YOUR_TABLE_NAME');

    const params = {};

    if (this.state.fields.length > 0) {
      params.fields = this.state.fields;
    }

    const filterByFormula = this.state.filterByFormula.trim();
    if (filterByFormula) {
      params.filterByFormula = filterByFormula;
    }

    const maxRecords = this.state.maxRecords ? parseInt(this.state.maxRecords, 10) : 0;
    if (maxRecords) {
      params.maxRecords = maxRecords;
    }

    const pageSize = this.state.pageSize ? parseInt(this.state.pageSize, 10) : 0;
    if (pageSize) {
      params.pageSize = pageSize;
    }

    if (this.state.sort.length > 0) {
      params.sort = this.state.sort;
    }

    const view = this.state.view.trim();
    if (view) {
      params.view = view;
    }

    const serializedParams = $.param(params);
    return `https://api.airtable.com/v0/${base}/${table}?${serializedParams}`;
  },
  render() {
    return (
      <div>
        <h1>Airtable API URL Encoder</h1>
        <p>
          You can use this interface to encode the parameters
          for listing records in a table.
        </p>
        <label className="section">
          <h2>Base ID</h2>
          <p>You can find the base ID on the API page. It begins with 'app'.</p>
          <input
            type="text"
            placeholder="app..."
            value={this.state.base}
            onChange={e => this.setState({base: e.target.value})}
          />
        </label>
        <label className="section">
          <h2>Table Name</h2>
          <input
             type="text"
             value={this.state.table}
             onChange={e => this.setState({table: e.target.value})}
          />
        </label>
        <div className="section">
          <h2 className="param">fields</h2>
          `<p>Only data for fields whose names are in this list will be included in the records. If you don't need every field, you can use this parameter to reduce the amount of data transferred.</p>`
          {this._renderFields()}
          <a onClick={this._addField}>+ Add field</a>
        </div>
        <div className="section">
          <h2 className="param">filterByFormula</h2>
          <p>A <a href="https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference" target="_blank">formula</a> used to filter records. The formula will be evaluated for each record, and if the result is not <code>0</code>, <code>false</code>, <code>""</code>, <code>NaN</code>, <code>[]</code>, or <code>#Error!</code> the record will be included in the response. If combined with view, only records in that view which satisfy the formula will be returned.</p>
          <textarea
             value={this.state.filterByFormula}
             onChange={e => this.setState({filterByFormula: e.target.value})}
           />
        </div>
        <div className="section">
          <h2 className="param">maxRecords</h2>
          <p>The maximum total number of records that will be returned.</p>
          <input
            type="number"
            min="1"
            value={this.state.maxRecords}
            onChange={e => this.setState({maxRecords: e.target.value})}
          />
        </div>
        <div className="section">
          <h2 className="param">pageSize</h2>
          <p>The number of records returned in each request. Must be less than or equal to 100. Default is 100.</p>
          <input
            type="number"
            min="1"
            max="100"
            value={this.state.pageSize}
            onChange={e => this.setState({pageSize: e.target.value})}
          />
        </div>
        <div className="section">
          <h2 className="param">sort</h2>
          <p>A list of sort objects that specifies how the records will be ordered.</p>
          {this._renderSorts()}
          <a onClick={this._addSort}>+ Add sort</a>
        </div>
        <div className="section">
          <h2 className="param">view</h2>
          <p>The name or ID of a view in the table. If set, only the records in that view will be returned. The records will be sorted according to the order of the view.</p>
          <input
            type="text"
            value={this.state.view}
            onChange={e => this.setState({view: e.target.value})}
          />
        </div>
        <div className="result">
          <div className="content">
            <h4>URL</h4>
            <textarea value={this._renderUrl()} readonly />
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render(<Encoder />, document.getElementById('root'));
