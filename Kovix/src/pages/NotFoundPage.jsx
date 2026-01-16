import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLottie } from "lottie-react";
import animationData from '../assets/404 retro.json';

function NotFoundPage() {
  const navigate = useNavigate();

  const options = {
    animationData: animationData,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return (
    <Container 
      className="d-flex flex-column align-items-center justify-content-center" 
      style={{ minHeight: '80vh' }}
    >
      <div style={{ maxWidth: '94%', width: '100%' }}>
        {View}
      </div>
      
      <h2 className="mt-4 mb-3 text-center">Упс! Сторінку не знайдено</h2>
      <p className="text-muted text-center mb-4">
        Схоже, ви загубилися у кінострічці.
      </p>
    </Container>
  );
}

export default NotFoundPage;