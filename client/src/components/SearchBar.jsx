import React, { Component } from 'react';
import styled from 'styled-components';
import { CSSTransitionGroup } from 'react-transition-group';

const Nav = styled.nav`
  width: 100%;
  height: auto;
  background-color:#2196F3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5em;
`;

const Results = styled.div`
  width: 100%;
  height: 8em;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const Result = styled.div`
  display: block;
  white-space: nowrap;
  font-size: 0.8em;
  border-radius: 2px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  background-color: whitesmoke;
  width: 23%;
  height: 2.2em;
  margin: 0.2em;
  padding: 0.4em;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Input = styled.input`
  width: 60%;
  height: 100%;
  font-size: 1.2em;
  text-align: center;
  border: none;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.5)
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 2em
`;

const Title = styled.h1`
  color: white;
  margin: 0.3em;
`;

function SearchBar({ handleSubmit, handleChange, results, value }) {
  return (
    <Nav>
      <Title>Human Phenotype Ontology</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          placeholder="Search for a Phenotype"
          value={value}
          onChange={handleChange}
        />
      </Form>
      <CSSTransitionGroup
        transitionName="results"
        transitionEnterTimeout={300}
        transitionLeave={false}
      >
        {results.length > 0 &&
          value &&
          <Results key={results[0].id}>
            {results.slice(0, 16).map(({ name, id }) => {
              return (
                <Result onClick={handleSubmit} key={id}>
                  {name}
                </Result>
              );
            })}
          </Results>}
      </CSSTransitionGroup>
    </Nav>
  );
}

export default SearchBar;
