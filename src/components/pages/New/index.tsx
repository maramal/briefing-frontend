import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Step } from '../../../entities/Step';
import { StepInput } from '../../../entities/StepInput';
import { Input } from '../../../entities/Input';
import { objectToArray, extract } from '../../../utils/functions';
import { InputCondition } from '../../../entities/InputCondition';
import { Condition } from '../../../entities/Condition';

export default () => {
    const [addedSteps, setAddedSteps] = useState([] as Step[]);
    const [inputs, setInputs] = useState([] as Input[]);
    const [conditions, setConditions] = useState([] as Condition[]);
    const [loadingInputs, setLoadingInputs] = useState(true);
    const [loadingConditions, setLoadingConditions] = useState(true);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    function addStep() {
        const step = new Step();
        if (addedSteps.length) {
            step.position = addedSteps[addedSteps.length-1].position + 1;
        }
        setAddedSteps([ ...addedSteps, step ]);
    }
    
    function addStepInput(stepPosition: number) {
        const modifiedStep = addedSteps.find((step: Step) => step.position === stepPosition) as Step;
        const otherSteps = addedSteps.filter((step: Step) => step.position !== stepPosition) as Step[];
        const newInput = new StepInput();
        modifiedStep?.inputs.push(newInput);
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        if (typeof steps === undefined) {
            setError(true);
            setErrorMessage('Hubo un error al cargar los campos');
            return;
        }
        setAddedSteps(steps as Step[]);
    }

    function addCondition(stepPosition: number, inputIndex: number) {
        const modifiedStep = addedSteps.find((step: Step) => step.position === stepPosition) as Step;
        const otherSteps = addedSteps.filter((step: Step) => step.position !== stepPosition) as Step[];
        const stepInput = modifiedStep.inputs[inputIndex];
        if (stepInput.conditions && stepInput.conditions.length) {
            stepInput.conditions.push(new InputCondition());
        } else {
            stepInput.conditions = [ new InputCondition() ];
        }
        modifiedStep.inputs[inputIndex] = stepInput;    
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        setAddedSteps(steps);
    }

    function compareStep(step1: any, step2: any): number {
        if (step1.position < step2.position) return -1;
        if (step1.position > step2.position) return 1;
        return 0;
    }

    function loadInputs() {
        axios.get('http://localhost:8080/api/input')
            .then(result => {
                const { data } = result.data;
                setInputs(
                    objectToArray<Input>(data)
                );
                setLoadingInputs(false);
            });
    }

    function loadConditions() {
        axios.get('http://localhost:8080/api/condition')
            .then(result => {
                const { data } = result.data;
                setConditions(
                    objectToArray<Condition>(data)
                );
                setLoadingConditions(false);
            });
    }

    function changeStepText(field: string, stepPosition: number, val: any): void {
        const modifiedStep = addedSteps.find(step => step.position === stepPosition) as Step;
        const otherSteps = addedSteps.filter(step => step.position !== stepPosition) as Step[];
        modifiedStep[field] = val;
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        setAddedSteps(steps);
    }

    function changeStepInputText(field: string, stepPosition: number, inputIndex: number, val: any): void {
        const modifiedStep = addedSteps.find(step => step.position === stepPosition) as Step;
        const otherSteps = addedSteps.filter(step => step.position !== stepPosition) as Step[];
        modifiedStep.inputs[inputIndex][field] = val;
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        setAddedSteps(steps);
    }

    function changeCondition(field: string, stepPosition: number, inputIndex: number, conditionIndex: number, val: any): void {
        const modifiedStep = addedSteps.find(step => step.position === stepPosition) as Step;
        const otherSteps = addedSteps.filter(step => step.position !== stepPosition) as Step[];
        const input = modifiedStep.inputs[inputIndex];
        if (!input.conditions || !input.conditions.length) return;
        input.conditions[conditionIndex][field] = val;
        modifiedStep.inputs[inputIndex] = input;
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        setAddedSteps(steps);
    }

    useEffect(() => {
        loadInputs();
        loadConditions();
    }, []);
    
    return (
        <div>
            <h1>Nuevo formulario</h1>
            {addedSteps.length > 0 && 
                <div className="steps">
                    {addedSteps.map((step: Step, stepIndex: number) => {
                        return (
                            <div className="step" key={stepIndex}>
                                <h2>Paso {step.position}</h2>
                                <div>
                                    <label>
                                        Título
                                        <input
                                            type="text"
                                            value={step.title} 
                                            onChange={e => { 
                                                changeStepText('title', step.position, e.target.value) 
                                            }} 
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        Subtítulo
                                        <input 
                                            type="text" 
                                            value={step.subtitle} 
                                            onChange={e => { 
                                                changeStepText('subtitle', step.position, e.target.value) 
                                            }} 
                                        />
                                    </label>
                                </div>
                                {step.inputs.length > 0 &&
                                    <div className="step-inputs">
                                        {step.inputs.map((stepInput: StepInput, inputIndex: number) => {
                                            return (
                                                <div className="step-input" key={inputIndex}>
                                                    <div>
                                                        <label>
                                                            Etiqueta
                                                            <input 
                                                                type="text" 
                                                                value={stepInput.label} 
                                                                onChange={ e => {
                                                                    changeStepInputText('label', step.position, inputIndex, e.target.value)
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <label>
                                                            Tipo
                                                            <select 
                                                                disabled={loadingInputs} 
                                                                defaultValue={stepInput.inputId || 'default'} 
                                                                onChange={ e => {
                                                                    changeStepInputText('conditionId', step.position, inputIndex, e.target.value)
                                                                }}
                                                            >
                                                                <option 
                                                                    disabled 
                                                                    value="default" 
                                                                    key="-1"
                                                                >{loadingInputs ? 'Cargando' : 'Selecciona un tipo'}</option>
                                                                {Object.keys(inputs).map((inputId, inputIndex) => {
                                                                    const input: Input = inputs[inputId];

                                                                    return (
                                                                        <option 
                                                                            key={inputIndex} 
                                                                            value={inputId}
                                                                        >{input.name}</option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </label>
                                                    </div>
                                                    {stepInput.conditions && stepInput.conditions.length > 0 &&
                                                        <div className="input-conditions">
                                                            {stepInput.conditions.map((condition: InputCondition, conditionIndex) => {

                                                                return (
                                                                    <div className="input-condition" key={conditionIndex}>
                                                                        <div>
                                                                            <label>
                                                                                Condición
                                                                                <select 
                                                                                    disabled={loadingConditions} 
                                                                                    defaultValue={'default'} 
                                                                                    onChange={e => {
                                                                                        changeCondition('type', step.position, inputIndex, conditionIndex, e.target.value)
                                                                                    }}
                                                                                >
                                                                                    <option 
                                                                                        disabled 
                                                                                        value="default" 
                                                                                        key="-1"
                                                                                    >{loadingConditions ? 'Cargando' : 'Selecciona una condición'}</option>
                                                                                    {Object.keys(conditions).map((conditionId, conditionIndex) => {
                                                                                        const condition: Condition = conditions[conditionId];
                                                                                        return (
                                                                                            <option 
                                                                                                key={conditionIndex} 
                                                                                                value={conditionId}
                                                                                            >{condition.name}</option>
                                                                                        );
                                                                                    })}
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                        <div className="step-condition">
                                                                            <label>
                                                                                Paso
                                                                                <select 
                                                                                    defaultValue={'default'} 
                                                                                    onChange={e => {
                                                                                        changeCondition('stepInputId', step.position, inputIndex, conditionIndex, e.target.value)
                                                                                    }}
                                                                                >
                                                                                    <option 
                                                                                        disabled 
                                                                                        value="default" 
                                                                                        key="-1"
                                                                                    >Selecciona un paso</option>
                                                                                    {addedSteps.map((step, stepIndex) => {
                                                                                        return (
                                                                                            <option 
                                                                                                key={stepIndex} 
                                                                                                value={step.position}
                                                                                            >{step.title || `Paso ${step.position}`}</option>
                                                                                        );
                                                                                    })}
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                        <div className="value-condition">
                                                                            <label>
                                                                                Valor
                                                                                <input 
                                                                                    type="text"
                                                                                    value={condition.value}
                                                                                    onChange={e => { 
                                                                                        changeCondition('value', step.position, inputIndex, conditionIndex, e.target.value); 
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    }
                                                    {addedSteps.length > 1 &&
                                                        <button onClick={e => { addCondition(step.position, inputIndex); }}>Agregar condición</button>
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                }
                                <button onClick={() => { addStepInput(step.position); }}>Agregar campo</button>
                            </div>
                        );
                    })}
                </div>
            }
            <button onClick={addStep}>Agregar paso</button>
        </div>
    );
};