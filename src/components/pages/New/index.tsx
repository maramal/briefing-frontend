import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Step } from '../../../entities/Step';
import { StepInput } from '../../../entities/StepInput';
import { Input } from '../../../entities/Input';
import { objectToArray } from '../../../utils/functions';
import { InputCondition } from '../../../entities/InputCondition';
import { Condition } from '../../../entities/Condition';
import { APIURL } from '../../../utils/server';
import { Briefing } from '../../../entities/Briefing';
import { 
    Container, 
    Stepper, 
    Step as MStep, 
    StepLabel, 
    Button, 
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

// Estilos en línea
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        step: {
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
        },
        input: {
            width: '50vw',
            marginBottom: theme.spacing(1),
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
        buttons: {
            marginTop: theme.spacing(3),
        },
    }),
);

/**
 * Títulos de los pasos (Stepper).
 */
function getSteps() {
    return [
        'Identidad',
        'Información básica',
        'Diseño'
    ];
}

export default () => {
    const classes = useStyles();
    // Definición de variables de estado
    const [activeStep, setActiveStep] = useState(0);
    const steps = getSteps();
    const [author, setAuthor] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [addedSteps, setAddedSteps] = useState([] as Step[]);
    const [inputs, setInputs] = useState([] as Input[]);
    const [conditions, setConditions] = useState([] as Condition[]);
    const [loadingInputs, setLoadingInputs] = useState(true);
    const [loadingConditions, setLoadingConditions] = useState(true);

    /**
     * Avanzar un paso en el Stepper.
     */
    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    /**
     * Retroceder un paso en el Stepper.
     */
    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    /**
     * Agrega un paso al formulario.
     */
    function addStep(): void {
        const step = new Step();
        if (addedSteps.length) {
            step.position = addedSteps[addedSteps.length-1].position + 1;
        }
        setAddedSteps([ ...addedSteps, step ]);
    }
    
    /**
     * Agrega una entrada `StepInput` al paso del formulario al array `Step.inputs`.
     * 
     * @param stepPosition Posición del paso (`Step.input`), es la 
     * identificación automática que se asigna al paso sin ID.
     */
    function addStepInput(stepPosition: number): void {
        const modifiedStep = addedSteps.find((step: Step) => step.position === stepPosition) as Step;
        const otherSteps = addedSteps.filter((step: Step) => step.position !== stepPosition) as Step[];
        const newInput = new StepInput();
        modifiedStep.inputs.push(newInput);
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        setAddedSteps(steps as Step[]);
    }

    /**
     * Agrega una condición `InputCondition` al campo del paso al array `StepInput.conditions`.
     * 
     * @param stepPosition Posición del paso (`Step.input`), es la 
     * identificación automática que se asigna al paso sin ID.
     * @param inputIndex Posición del campo en el array (`Step.inputs`).
     */
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

    /**
     * Función para ordenar los pasos acorde a su posición (`Step.position`).
     * 
     * @param step1 Primer paso a comparar.
     * @param step2 Segundo paso a comparar.
     */
    function compareStep(step1: any, step2: any): number {
        if (step1.position < step2.position) return -1;
        if (step1.position > step2.position) return 1;
        return 0;
    }

    /**
     * Carga los campos para llenar los `select`.
     */
    function loadInputs() {
        axios.get(`${APIURL}/input`)
            .then(result => {
                const { data } = result.data;
                setInputs(
                    objectToArray<Input>(data)
                );
                setLoadingInputs(false);
            });
    }

    /**
     * Carga las condiciones para llenar los `select`.
     */
    function loadConditions() {
        axios.get(`${APIURL}/condition`)
            .then(result => {
                const { data } = result.data;
                setConditions(
                    objectToArray<Condition>(data)
                );
                setLoadingConditions(false);
            });
    }

    /**
     * Cambia el valor de un campo de un paso acorde a la posición del mismo.
     * 
     * @param field Clave de la propiedad a cambiar (`title` o `subtitle`).
     * @param stepPosition Posición del paso (`step.position`).
     * @param val Valor a asignar.
     */
    function changeStepText(field: string, stepPosition: number, val: any): void {
        const modifiedStep = addedSteps.find(step => step.position === stepPosition) as Step;
        const otherSteps = addedSteps.filter(step => step.position !== stepPosition) as Step[];
        modifiedStep[field] = val;
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        setAddedSteps(steps);
    }

    /**
     * Cambia el valor de un campo de un paso acorde a la posición del mismo y del campo.
     * 
     * @param field Clave de la propiedad a cambiar.
     * @param stepPosition Posición del paso (`step.position`).
     * @param inputIndex Posición del campo en el array (`Step.inputs`).
     * @param val Valor a asignar.
     */
    function changeStepInputText(field: string, stepPosition: number, inputIndex: number, val: any): void {
        const modifiedStep = addedSteps.find(step => step.position === stepPosition) as Step; console.log(modifiedStep)
        const otherSteps = addedSteps.filter(step => step.position !== stepPosition) as Step[];
        modifiedStep.inputs[inputIndex][field] = val;
        const steps = [ modifiedStep, ...otherSteps ].sort(compareStep);
        setAddedSteps(steps);
    }

    /**
     * Cambia el valor de una condición de un campo del paso del formulario
     * 
     * @param field Clave de la propiedad a cambiar.
     * @param stepPosition Posición del paso (`step.position`).
     * @param inputIndex Posición del campo en el array (`Step.inputs`).
     * @param conditionIndex Posición de la condición en el array de condiciones (`StepInput.conditions`).
     * @param val Valor a asignar.
     */
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

    /**
     * Envía la información procesada al servidor.
     */
    function save() {
        console.log('save attempt');
    }

    /**
     * Carga inicial de datos.
     */
    useEffect(() => {
        loadInputs();
        loadConditions();
    }, []);
    
    return (
        <Container>
            <Typography variant="h3">Nuevo formulario</Typography>

            {/** Pasos del formulario => */}
            <Stepper activeStep={activeStep}>
                {steps.map(label => (
                    <MStep key={label}>
                        <StepLabel>{label}</StepLabel>
                    </MStep>
                ))}
            </Stepper>
            {/** <= Pasos del formulario */}

            <div className="container">
                {/** Correo electrónico => */}
                {activeStep === 0 && (
                    <div className={classes.step}>
                        <TextField
                            label="Correo electrónico"
                            variant="outlined"
                            type="email"
                            className={classes.input}
                            value={author}
                            onChange={e => { setAuthor(e.target.value); }}
                        />
                    </div>
                )}
                {/** <= Correo electrónico */}

                {/** Título y subtítulo => */}
                {activeStep === 1 && (
                    <div className={classes.step}>
                        <div className="title">
                            <TextField
                                label="Título"
                                variant="outlined"
                                type="text"
                                className={classes.input}
                                value={title}
                                onChange={e => { setTitle(e.target.value); }}
                            />
                        </div>
                        <div className="description">
                            <TextField
                                label="Descripción"
                                variant="outlined"
                                type="text"
                                className={classes.input}
                                value={description}
                                onChange={e => { setDescription(e.target.value); }}
                            />
                        </div>
                    </div>
                )}
                {/** <= Título y subtítulo */}

                {/** Pasos => */}
                {activeStep === 2 && (
                    <div className="design">
                        {addedSteps.length > 0 && 
                            <div className="steps">
                                {/** Paso => */}
                                {addedSteps.map((step: Step, stepIndex: number) => {
                                    return (
                                        <div className="step" key={stepIndex}>
                                            <h2>Paso {step.position}</h2>
                                            <div>
                                                <TextField
                                                    label="Título"
                                                    variant="outlined"
                                                    type="text"
                                                    className={classes.input}
                                                    value={step.title} 
                                                    onChange={e => { 
                                                        changeStepText('title', step.position, e.target.value) 
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Subtítulo"
                                                    variant="outlined"
                                                    type="text" 
                                                    className={classes.input}
                                                    value={step.subtitle} 
                                                    onChange={e => { 
                                                        changeStepText('subtitle', step.position, e.target.value) 
                                                    }} 
                                                />
                                            </div>
                                            {/** Campos => */}
                                            {step.inputs.length > 0 &&
                                                <div className="step-inputs">
                                                    {/** Campo => */}
                                                    {step.inputs.map((stepInput: StepInput, inputIndex: number) => {
                                                        return (
                                                            <div className="step-input" key={inputIndex}>
                                                                <div>
                                                                    <TextField
                                                                        label="Etiqueta"
                                                                        variant="outlined"
                                                                        type="text" 
                                                                        className={classes.input}
                                                                        value={stepInput.label} 
                                                                        onChange={ e => {
                                                                            changeStepInputText('label', step.position, inputIndex, e.target.value)
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <FormControl variant="outlined" className={classes.formControl}>
                                                                        <InputLabel shrink id={`input-type-${inputIndex}-label`}>Tipo</InputLabel>
                                                                        <Select
                                                                            labelId={`input-type-${inputIndex}-label`}
                                                                            id={`input-type-${inputIndex}-select`}
                                                                            disabled={loadingInputs}
                                                                            value={stepInput.inputId} 
                                                                            displayEmpty
                                                                            onChange={ e => {
                                                                                changeStepInputText('inputId', step.position, inputIndex, e.target.value)
                                                                            }}
                                                                        >
                                                                            <MenuItem 
                                                                                disabled 
                                                                                value="" 
                                                                                key="-1"
                                                                            >{loadingInputs ? 'Cargando' : 'Selecciona un tipo'}</MenuItem>
                                                                            {Object.keys(inputs).map((inputId, inputIndex) => {
                                                                                const input: Input = inputs[inputId];
                                                                                return (
                                                                                    <MenuItem 
                                                                                        key={inputIndex} 
                                                                                        value={inputId}
                                                                                    >{input.name}</MenuItem>
                                                                                );
                                                                            })}
                                                                        </Select>
                                                                    </FormControl>
                                                                </div>

                                                                {/** Condiciones => */}
                                                                {stepInput.conditions && stepInput.conditions.length > 0 &&
                                                                    <div className="input-conditions">
                                                                        {/** Condición => */}
                                                                        {stepInput.conditions.map((condition: InputCondition, conditionIndex) => {
                                                                            return (
                                                                                <div className="input-condition" key={conditionIndex}>
                                                                                    <div>
                                                                                        <FormControl variant="outlined" className={classes.formControl}>
                                                                                            <InputLabel shrink id={`input-condition-${conditionIndex}-label`}>Condición</InputLabel>
                                                                                            <Select
                                                                                                labelId={`input-condition-${conditionIndex}-label`}
                                                                                                id={`input-condition-${conditionIndex}-select`}
                                                                                                disabled={loadingConditions}
                                                                                                value={condition.conditionId} 
                                                                                                displayEmpty
                                                                                                onChange={e => {
                                                                                                    changeCondition('conditionId', step.position, inputIndex, conditionIndex, e.target.value);
                                                                                                }}
                                                                                            >
                                                                                                <MenuItem 
                                                                                                    disabled 
                                                                                                    value="" 
                                                                                                    key="-1"
                                                                                                >{loadingConditions ? 'Cargando' : 'Selecciona una condición'}</MenuItem>
                                                                                                {Object.keys(conditions).map((conditionId, conditionIndex) => {
                                                                                                    const condition: Condition = conditions[conditionId];
                                                                                                    return (
                                                                                                        <MenuItem 
                                                                                                            key={conditionIndex} 
                                                                                                            value={conditionId}
                                                                                                        >{condition.name}</MenuItem>
                                                                                                    );
                                                                                                })}
                                                                                            </Select>
                                                                                        </FormControl>
                                                                                    </div>
                                                                                    <div className="step-condition">
                                                                                        <FormControl variant="outlined" className={classes.formControl}>
                                                                                            <InputLabel shrink id={`step-condition-${conditionIndex}-label`}>Paso</InputLabel>
                                                                                            <Select
                                                                                                labelId={`step-condition-${conditionIndex}-label`}
                                                                                                id={`step-condition-${conditionIndex}-select`}
                                                                                                disabled={loadingConditions}
                                                                                                value={condition.stepInputId} 
                                                                                                displayEmpty
                                                                                                onChange={e => {
                                                                                                    changeCondition('stepInputId', step.position, inputIndex, conditionIndex, e.target.value)
                                                                                                }}
                                                                                            >
                                                                                                <MenuItem 
                                                                                                    disabled 
                                                                                                    value="" 
                                                                                                    key="-1"
                                                                                                >Selecciona un paso</MenuItem>
                                                                                                {addedSteps.map((step, stepIndex) => {
                                                                                                    return (
                                                                                                        <MenuItem 
                                                                                                            key={stepIndex} 
                                                                                                            value={step.position}
                                                                                                        >{step.title || `Paso ${step.position}`}</MenuItem>
                                                                                                    );
                                                                                                })}
                                                                                            </Select>
                                                                                        </FormControl>
                                                                                    </div>
                                                                                    <div className="value-condition">
                                                                                        <TextField
                                                                                            label="Valor"
                                                                                            variant="outlined"
                                                                                            type="text"
                                                                                            className={classes.input}
                                                                                            value={condition.value}
                                                                                            onChange={e => { 
                                                                                                changeCondition('value', step.position, inputIndex, conditionIndex, e.target.value); 
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {/** <= Condición */}
                                                                    </div>
                                                                }
                                                                {addedSteps.length > 1 &&
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="secondary"
                                                                        onClick={e => { addCondition(step.position, inputIndex); }}
                                                                    >Agregar condición</Button>
                                                                }
                                                                {/** <= Condiciones */}
                                                            </div>
                                                        );
                                                    })}
                                                    {/** <= Paso */}
                                                </div>
                                            }
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => { addStepInput(step.position); }}
                                            >Agregar campo
                                            </Button>
                                            {/** <= Campos */}
                                        </div>
                                    );
                                })}
                                {/** <= Pasos */}
                            </div>
                        }
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={addStep}
                        >Agregar paso
                        </Button>
                    </div>
                )}
                {/** <= Pasos */}

                {/** Finalización => */}
                {activeStep === steps.length && (
                    <div>
                        Finalización
                    </div>
                )}
                {/** <= Finalización */}
            </div>

            <div className={classes.buttons}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                >Atrás</Button>
                <Button
                    disabled={activeStep === steps.length}
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                >
                    {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
            </div>
        </Container>
    );
};