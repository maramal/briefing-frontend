import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefing } from '../../../entities/Briefing';
import { Step } from '../../../entities/Step';
import { APIURL, APICONFIG } from '../../../utils/server';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { objectToArray } from '../../../utils/functions';
import { StepInput } from '../../../entities/StepInput';
import { Input } from '../../../entities/Input';
import {
    Container, 
    Modal, 
    Typography, 
    Backdrop,
    CircularProgress,
    TextField,
    Button,
    Stepper,
    Step as MStep,
    StepLabel,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Input as MInput,
} from '@material-ui/core';

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
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff'
        },
    }),
);

export default (props: any) => {
    const classes = useStyles();

    // Definición de variables de estado
    const [activeStep, setActiveStep] = useState(0);
    const [briefing, setBriefing] = useState({} as Briefing);
    const [steps, setSteps] = useState([] as Step[]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [inputs, setInputs] = useState([] as Input[]);

    async function loadBriefing() {
        const briefingId: string = props.match.params.bid;
        const result = await axios.get(`${APIURL}/briefing/${briefingId}`, APICONFIG);
        const { data } = result;
        if (data.status >= 400) {
            setErrorValue(data.message);
            return;
        }
        const briefing: Briefing = data.data;
        setBriefing(briefing);
        setSteps(briefing.steps);
    }

    async function loadInputs() {
        const result = await axios.get(`${APIURL}/input`, APICONFIG);
        const { data } = result;
        if (data.status >= 400) { 
            setErrorValue(data.message);
            return;
        }
        const inputs: Input[] = data.data;
        setInputs(inputs);
    }

    function setErrorValue(msg: string) {
        setError(true);
        setErrorMessage(msg);
        setModalOpen(true);
    }

    function clearError() {
        setError(false);
        setErrorMessage('');
        setModalOpen(false);
    }

    function handleModalClose() {
        setModalOpen(false);
    }

    /**
     * Avanzar un paso en el Stepper.
     */
    const handleNext = () => {
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
     * Guardar el formulario
     */
    function save() {
        handleNext();
    }

    useEffect(() => {
        loadBriefing();
        loadInputs();
    }, []);

    useEffect(() => {
        if (briefing.steps && inputs) setLoading(false);
        if (briefing.title) document.title += ` | ${briefing.title}`;
    }, [briefing, inputs]);

    return (
        <Container>
            <Backdrop
                className={classes.backdrop}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
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
            <Typography variant="h2">{briefing.title}</Typography>
            <Typography variant="h3">{briefing.description}</Typography>

             {/** Pasos del formulario => */}
             <Stepper activeStep={activeStep}>
                {steps.map((step, index) => (
                    <MStep key={index}>
                        <StepLabel>{step.title}</StepLabel>
                    </MStep>
                ))}
            </Stepper>
            {/** <= Pasos del formulario */}

            {/** Contenido del formulario => */}
            <Container>
                {steps.map((step, index) => {
                    if (index !== activeStep) return;
                    const sInputs: StepInput[] = step.inputs;

                    return (
                        <Container key={index}>
                            <Typography variant="h5">{step.title}</Typography>
                            <Typography variant="h6">{step.description}</Typography>
                            <hr />
                            {sInputs.map((sInput, index) => {
                                const input = inputs.find(input => input.id === sInput.inputId);
                                if (input === undefined) return;

                                return (
                                    <Container key={index}>
                                        <label>
                                            <p>{sInput.label}</p>
                                            <MInput 
                                                type={input.value}
                                            />
                                            <p>{sInput.helper}</p>
                                        </label>
                                    </Container>
                                );
                            })}
                        </Container>
                    );
                })}
            </Container>
            {/** <= Contenido del formulario */}

            {/** Finalización => */}
            {activeStep === steps.length && (
                <div>
                    <Typography variant="h4">Formulario finalizado</Typography>

                </div>
            )}
            {/** <= Finalización */}

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