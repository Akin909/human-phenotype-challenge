import React, { Component } from 'react';
import Graph from 'react-graph-vis';
import SearchBar from './SearchBar.jsx';
import options from './GraphConfig.js';

import { findInDoubleQuotes, removeDuplicateObj } from './../utils.js';
import {
  Container,
  Active,
  ActiveBody,
  ActiveTitle,
  Button
} from './styled.jsx';
import data from './../../../hpo.json';

const HPO = Object.values(data);

class Phenotypes extends Component {
  state = {
    input: '',
    results: [],
    selected: data['HP:0000118'],
    graph: {},
    active: {},
    error: ''
  };

  componentDidMount() {
    const { nodes, edges } = this.combineEdgesAndNodes();
    this.setState({ graph: { nodes, edges } });
  }

  /**
   * Takes a phenotype object or id and returns a graph node object
   *
   * @param {String or Object} A phenotype object or the id of one
   * @returns {Object} A graph node with a label, id and its children
   */
  createNode = (node, color) => {
    let id, label, relatives, children, parents;
    if (typeof node === 'string') {
      const childNode = data[node];
      ({ id, name: label, relatives: { children, parents } } = childNode);
    } else if (node.relatives) {
      ({ id, name: label, relatives: { children, parents } } = node);
    } else {
      return console.warn('Node does not have requisite props');
    }
    return { id, label, children, parents, color };
  };

  createEdges = (children, firstNode) => {
    const parentEdges = firstNode.parents.map(parent => ({
      from: parent, // Order of to and from is reversed for parents
      to: firstNode.id
    }));
    const childEdges = children.map(child => ({
      from: firstNode.id,
      to: child.id
    }));
    return [...childEdges, ...parentEdges];
  };

  combineEdgesAndNodes(selected = this.state.selected) {
    const firstNode = this.createNode(selected, '#B2DFDB');
    if (!firstNode) {
      return console.warn('No node created');
    }
    const parents = firstNode.parents.map(parent =>
      this.createNode(parent, 'red')
    );
    const children = firstNode.children.map(child => this.createNode(child));
    const edges = this.createEdges(children, firstNode);
    const nodes = [...children, ...parents, firstNode];
    return { nodes, edges };
  }

  getAncestors(goid, array = []) {
    //Recursively build up an array of all the preceding/ancestor nodes
    let recursiveArray = [goid, ...array];
    if (data[goid]) {
      const { parents } = data[goid].relatives;
      if (!parents.length) {
        return recursiveArray;
      } else if (parents.length > 0) {
        const [result] = parents.map(parent =>
          this.getAncestors(parent, recursiveArray)
        );
        return result;
      }
    }
  }

  renderAncestors = () => {
    //TODO this functions behaviour is erratic
    //Use array of ancestor ids to create edges then for each create a node
    //with its children and replace graph nodes with that
    const { selected: { id }, graph } = this.state;
    const ancestors = this.getAncestors(id);
    const { nodes, edges } = ancestors.reduce(
      (acc, ancestor) => {
        const node = this.createNode(ancestor);
        const edges = this.createEdges(node.children, node);
        acc.nodes = [node, ...acc.nodes];
        acc.edges = [...edges, ...acc.edges];
        return acc;
      },
      { nodes: [], edges: [] }
    );

    try {
      this.setState({
        graph: {
          nodes: removeDuplicateObj([...graph.nodes, ...nodes], 'id'),
          edges: removeDuplicateObj([...graph.edges, ...edges], 'to')
        }
      });
    } catch (e) {
      this.setState({ error: e });
    }
  };

  handleChange = ({ target: { value, id } }) => {
    const results = this.names.filter(({ name }) => name.includes(value));
    this.setState({ input: value, results });
  };

  handleSubmit = event => {
    //Find the matching phenotype based on input and rerender that with its
    //parent and children
    event.preventDefault();
    const { target: { value }, currentTarget: { textContent } } = event;
    const { graph } = this.state;
    const node = HPO.find(({ name }) => name === (value || textContent));
    const { nodes, edges } = this.combineEdgesAndNodes(node);
    this.setState({
      graph: { ...graph, nodes, edges },
      input: '',
      selected: node,
      results: []
    });
  };

  closeActiveBox = () => {
    this.setState({ active: {} });
  };

  events = {
    select: event => {
      const { graph } = this.state;
      const { nodes: [evtNode], edges } = event;
      const node = data[evtNode];
      console.log('evtNode', evtNode);
      this.setState({ active: node });
    },
    doubleClick: event => {
      if (event.nodes.length < 1) {
        return console.warn('No node is attached to this event');
      }
      const { nodes: [evtNode] } = event;
      const node = data[evtNode];
      const { nodes, edges } = this.combineEdgesAndNodes(node);
      this.setState({ graph: { nodes, edges }, selected: node });
    }
  };

  //Remove the first value from the data as it is hpo meta data
  names = Object.values(data).slice(1).map(({ name, id }) => ({ name, id }));

  render() {
    const { graph, input, results, active, error } = this.state;
    return (
      <Container>
        <SearchBar
          data={this.names}
          value={input}
          results={results}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
        />
        {error && <div>Woops that didn't work 🙇🏾</div>}
        <ul>
          <li>Double Click to Change Node</li>
          <li>Click Once to get the definition</li>
          <li> Search for a Phenotype and Click the result you want! </li>
        </ul>
        {graph.nodes &&
          <Graph
            style={{ width: '90vw', height: '60vh' }}
            graph={graph}
            options={options}
            events={this.events}
          />}
        <Button onClick={this.renderAncestors}>Show Ancestors</Button>
        {active.id &&
          <Active onClick={this.closeActiveBox}>
            <ActiveTitle>{active.name}</ActiveTitle>
            <ActiveBody>{findInDoubleQuotes(active.def)}</ActiveBody>
            <Button small>Close</Button>
          </Active>}
      </Container>
    );
  }
}

export default Phenotypes;
