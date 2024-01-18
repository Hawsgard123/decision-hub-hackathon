import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { AddToRules, ResetAllRules } from '../slices/createRuleSlice';
import { Button } from '@mui/material';
import { getAllParameters } from '../services/operations/getAllRulesAPI';

const operatorsByFieldType = {
    operators: ['=', '!=', '<', '>', '+', '-', '*', '/'],
};

const RuleBuilder = (props) => {
    const [criteria, setCriteria] = useState('all');
    const [rules, setRules] = useState([]);
    const dispatch = useDispatch();
    const { allRules } = useSelector((state) => state.createRule)
    const [parameterList, setParameterList] = useState([])

    // returning allRules array to its initial state
    if (!props.parentId) {
        dispatch(ResetAllRules());
    }


    const generateId = () => {
        return Math.floor(Math.random())
    }
    const parentId = props.parentId ? props.parentId : generateId()

    const handleCriteriaChange = (newCriteria) => {
        setCriteria(newCriteria);
    };




    const handleAddRule = () => {
        const newRule = {
            id: new Date().getTime(),
            field: '',
            operator: '',
            value: '',
            parentId: parentId
        };
        setRules([...rules, newRule]);
    };

    const handleNestedRule = () => {
        const newNestedRule = {
            id: parentId + 1,
            criteria: criteria,
            rules: [],
            parentId: parentId,
        };
        setRules((prevRules) => [...prevRules, newNestedRule]);
    };

    const handleLogicalOperatorChange = (ruleId, newOperator) => {
        setRules(
            rules.map((rule) =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        criteria: newOperator,
                    }
                    : rule
            )
        );
    };

    const handleRemoveRule = (ruleId) => {
        setRules(rules.filter((rule) => rule.id !== ruleId));
    };

    const handleFieldChange = (field, ruleId) => {
        setRules(
            rules.map((rule) =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        field,
                        operator: '', // Reset operator when the field changes
                    }
                    : rule
            )
        );
    };

    const handleOperatorChange = (operator, ruleId) => {
        setRules(
            rules.map((rule) =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        operator,
                    }
                    : rule
            )
        );
    };

    const handleValueChange = (value, ruleId) => {
        setRules(
            rules.map((rule) =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        value,
                    }
                    : rule
            )
        );
    };

    const convertToRuleObject = (rulesArray) => {
        const resultObject = {};
        rulesArray.forEach((rule) => {
            if (rule.hasOwnProperty('field')) {
                resultObject[rule.field] = rule.value;
            } else {
                resultObject[rule.criteria] = convertToRuleObject(rule.rules);
            }
        });
        return resultObject;
    };

    const handleSubmit = () => {
        // const ruleObject = convertToRuleObject(rules);
        // console.log('Submitted Rule Object:', ruleObject);
        console.log('Submitted Rule Object:', rules);
        let newArr = [...allRules, ...rules]
        dispatch(AddToRules(newArr))
    }

    const finalSubmit = () => {
        let newParentRuleObj = {
            id: parentId,
            criteria: criteria,
            rules: [],
        }

        let newArray = [newParentRuleObj, ...allRules]

        dispatch(AddToRules(newArray));
        console.log(allRules)
    }

    useEffect(() => {
        const fetchData = async () => {
            let result = await getAllParameters();
            if (result) {
                console.log(result);
                setParameterList(result);
            }
        };

        fetchData();

    }, []);

    return (
        <StyledContainer>
            <Heading className="text-white text-lg mb-4">Nested Rule {rules.length + 1}</Heading>

            <div className="flex justify-end">
                <div>
                    <label className="text-white" htmlFor="RuleCriteriaDropdown">
                        Select Criteria:&nbsp;&nbsp;
                    </label>
                    <select
                        id="RuleCriteriaDropdown"
                        value={criteria}
                        onChange={(e) => handleCriteriaChange(e.target.value)}
                        className="bg-black text-white p-2 rounded"
                    >
                        <option value="all">All</option>
                        <option value="any">Any</option>
                    </select>
                </div>
            </div>

            <div className="mt-4">
                <button onClick={handleAddRule} className="mr-2 bg-blue-500 text-white p-2 rounded">
                    Add Rule
                </button>
                <button onClick={handleNestedRule} className="bg-green-500 text-white p-2 rounded">
                    Nested Rule
                </button>
            </div>

            {rules.map((rule, index) =>
                rule.hasOwnProperty('field') ? (
                    <RuleContainer key={rule.id}>
                        <div>
                            <label className="text-white" htmlFor={`field-${rule.id}`}>
                                Select Field:
                            </label>
                            <select
                                id={`field-${rule.id}`}
                                value={rule.field ? rule.field : 'Name'}
                                onChange={(e) => handleFieldChange(e.target.value, rule.id)}
                                className="bg-black text-white p-2 rounded"
                            >
                                {
                                    parameterList.map((p, index) => (
                                        <option key={index} value={p}>{p}</option>
                                    ))
                                }
                                <option value="name">Name</option>
                                <option value="age">Age</option>
                                <option value="dateOfBirth">Date of Birth</option>
                            </select>
                        </div>

                        {rule.field && (
                            <>
                                <div>
                                    <label className="text-white" htmlFor={`operator-${rule.id}`}>
                                        Select Operator:
                                    </label>
                                    <select
                                        id={`operator-${rule.id}`}
                                        value={rule.operator ? rule.operator : '='}
                                        onChange={(e) => handleOperatorChange(e.target.value, rule.id)}
                                        className="bg-black text-white p-2 rounded"
                                    >
                                        {operatorsByFieldType.operators.map((operator) => (
                                            <option key={operator} value={operator}>
                                                {operator}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Value"
                                    value={rule.value}
                                    onChange={(e) => handleValueChange(e.target.value, rule.id)}
                                    className="bg-black text-white p-2 rounded"
                                />
                                <button onClick={() => handleRemoveRule(rule.id)} className="bg-red-500 text-white p-2 rounded">
                                    Remove Rule
                                </button>
                            </>
                        )}
                    </RuleContainer>
                ) : (
                    <div key={rule.id} className="mt-4">
                        <RuleBuilder rules={rules} parentId={parentId + 1} />

                        <button onClick={() => handleRemoveRule(rule.id)} className="bg-red-500 text-white p-2 rounded mt-2">
                            Remove Rule
                        </button>
                    </div>
                )
            )}

            <div className="mt-4">
                <button onClick={handleSubmit} className="bg-green-500 text-white p-2 rounded">
                    Submit
                </button>
            </div>

            {!props.parentId &&
                <div className="mt-4 w-[100px] mx-auto">
                    <Button onClick={finalSubmit} variant='contained' className=" bg-black text-white p-2 rounded">
                        Submit
                    </Button>
                </div>
            }

        </StyledContainer>
    );
};

const StyledContainer = styled.div`
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-height: 85vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.1);
  position: relative;
`;

const RuleContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
`;

const Heading = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

export default RuleBuilder;