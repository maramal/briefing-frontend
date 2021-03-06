import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Step } from '../../../entities/Step';
import { StepInput } from '../../../entities/StepInput';
import { Input } from '../../../entities/Input';
import { objectToArray, rand, getLocalURL } from '../../../utils/functions';
import { InputCondition } from '../../../entities/InputCondition';
import { Condition } from '../../../entities/Condition';
import { APIURL, APICONFIG } from '../../../utils/server';
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
    MenuItem,
    Modal
} from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { TheatersRounded } from '@material-ui/icons';

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
        paper: {
            margin: theme.spacing(50, 90),
            position: 'absolute',
            width: 400,
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
        stepInputs: {
            marginTop: theme.spacing(5)
        },
        stepInput: {
            padding: theme.spacing(2),
            border: '1px solid #5e5e5e',
            borderRadius: '5px',
            marginBottom: theme.spacing(3),
        },
        button: {
            marginBottom: theme.spacing(1),
        },
    }),
);

/**
 * Títulos de los pasos (Stepper).
 */
function getSteps() {
    return [
        'Identidad', // 0
        'Información básica', // 1
        'Diseño' // 2
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
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [briefing, setBriefing] = useState({} as Briefing);

    /**
     * Avanzar un paso en el Stepper.
     */
    const handleNext = () => {
        if (!author.length) {
            setErrorValue('Tu dirección de correo electrónico es importante para que podamos crearte un panel personalizado para gestionar tus formularios.');
            return;
        }

        if (!title.length && activeStep === 1) {
            setErrorValue('Necesitas un título para diferenciar tus formularios.');
            return;
        }

        clearError();

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

    function setErrorValue(msg: string): void {
        setError(true);
        setErrorMessage(msg);
        setModalOpen(true);
    }

    function clearError() {
        setError(false);
        setErrorMessage('');
        setModalOpen(false);
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
        const modifiedStep = addedSteps.find(step => step.position === stepPosition) as Step;
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
    async function save() {
        const briefing = new Briefing();
        briefing.title = title;
        briefing.description = description;
        briefing.author = author;
        briefing.steps = addedSteps;

        const result = await axios.post(`${APIURL}/briefing`, briefing, APICONFIG);
        const { data } = result;
        if (data.status >= 400) {
            setErrorValue(data.message);
            return;
        }
        setBriefing(data.data);
        handleNext();
    }

    function handleModalClose() {
        setModalOpen(false);
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
            {error && (
                <Modal
                    open={modalOpen}
                    onClose={handleModalClose}
                    aria-labelledby="error-modal-title"
                    aria-describedby="error-modal-description"
                >
                    <div className={classes.paper}>
                        <Typography variant="h5" id="error-modal-title">¡Ups!</Typography>
                        <p id="error-modal-description">{errorMessage}</p>
                    </div>
                </Modal>
            )}
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
                                multiline
                                rowsMax={4}
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
                                                    label="Descripción"
                                                    variant="outlined"
                                                    multiline
                                                    rowsMax={4}
                                                    type="text" 
                                                    className={classes.input}
                                                    value={step.description} 
                                                    onChange={e => { 
                                                        changeStepText('description', step.position, e.target.value) 
                                                    }} 
                                                />
                                            </div>
                                            {/** Campos => */}
                                            {step.inputs.length > 0 &&
                                                <div className={classes.stepInputs}>
                                                    <Typography variant="h4">Campos</Typography>
                                                    {/** Campo => */}
                                                    {step.inputs.map((stepInput: StepInput, inputIndex: number) => {
                                                        return (
                                                            <div className={classes.stepInput} key={inputIndex}>
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
                                                                            {inputs.map((input, i) => {
                                                                                return (
                                                                                    <MenuItem 
                                                                                        key={i} 
                                                                                        value={input.id}
                                                                                    >{input.name}</MenuItem>
                                                                                );
                                                                            })}
                                                                        </Select>
                                                                    </FormControl>
                                                                </div>

                                                                {/** Condiciones => */}
                                                                {stepInput.conditions && stepInput.conditions.length > 0 &&
                                                                    <div className="input-conditions">
                                                                        <Typography variant="h5">Condiciones</Typography>
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
                                                                        className={classes.button}
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
                                                className={classes.button}
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
                        <Typography variant="h4">Diseño de formulario finalizado</Typography>

                        <p>Ahora puedes compartir el enlace de tu formulario:</p>
                        <TextField 
                            label="Dirección URL"
                            variant="outlined"
                            value={getLocalURL(`b/${briefing.id}`)}
                            className={classes.input}
                            type="url"
                            disabled
                        />
                        <p>Te hemos enviado la información a tu dirección de correo electrónico.</p>
                        <p>Puedes acceder al panel desde aquí.</p>
                        <Button
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to={`/${briefing.author}/access?token=123ref`}
                        >
                            Ir al panel
                        </Button>
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
                    disabled={activeStep === steps.length + 1}
                    variant="contained"
                    color="primary"
                    onClick={(activeStep === steps.length - 1) ? save : handleNext}
                >
                    {(activeStep === steps.length - 1) ? 'Finalizar' : 'Siguiente'}
                </Button>
            </div>
        </Container>
    );
};