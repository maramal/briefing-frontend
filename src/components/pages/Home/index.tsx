import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <div>
            <h1>Inicio</h1>
            <Link to="/nuevo">Crear formulario</Link>
        </div>
    );
};