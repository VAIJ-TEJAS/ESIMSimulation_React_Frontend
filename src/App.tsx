/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button } from 'antd';
import { Stage, Layer, Rect, Line, Group, Text, Image } from 'react-konva';
import useImage from 'use-image';
import Phone from "./assets/images/phone.png"

interface Shape {
  x: number;
  y: number;
  id: string;
  imei: string;
}

interface ServiceProvider {
  x: number;
  y: number;
  id: string;
  name: string;
}

interface ServiceProviderProps {
  x: number;
  y: number;
  id: string;
  name: string;
  onDragMove: (id: string, x: number, y: number) => void;
}

interface CentralServiceProviderProps {
  shapes: Shape[];
  serviceProviders: ServiceProvider[];
}


const Mobile: React.FC<Shape & { onDragMove: (id: string, x: number, y: number) => void }> = ({ x, y, id, imei, onDragMove }) => {
  const [image] = useImage(Phone);

  const handleDragMove = (e: any) => {
    onDragMove(id, e.target.x(), e.target.y());
  };

  return (
    <Group
      draggable
      onDragMove={handleDragMove}
      x={x}
      y={y}
    >
      <Line
        points={[
          25, 15,
          window.innerWidth / 2 - x, window.innerHeight / 2 - y,
        ]}
        stroke="black"
        strokeWidth={4}
        offsetX={-25}
        offsetY={-25}
      />
      {image && (
        <Image
          image={image}
          width={100}
          height={100}
        />
      )}
      <Text
        text={"IEMI: " + imei}
        fontSize={12}
        fill="black"
        x={-15}
        y={-15}
      />
    </Group>
  );
};


const ServiceProviderComponent: React.FC<ServiceProviderProps> = ({ x, y, id, name, onDragMove }) => {
  const handleDragMove = (e: any) => {
    onDragMove(id, e.target.x(), e.target.y());
  };

  // Adjust these dimensions and positions as needed
  const rectWidth = 100;
  const rectHeight = 100;
  const rectOffsetX = rectWidth / 2;
  const rectOffsetY = rectHeight / 2;

  return (
    <Group
      draggable
      onDragMove={handleDragMove}
      x={x}
      y={y}
    >
      <Line
        points={[
          0, 0,
          window.innerWidth / 2 - x, window.innerHeight / 2 - y,
        ]}
        stroke="red"
        strokeWidth={4}
      />
      <Rect
        width={rectWidth}
        height={rectHeight}
        fill="lightGray"
        offsetX={rectOffsetX}
        offsetY={rectOffsetY}
        cornerRadius={5}
      />
      <Text
        text={name}
        fontSize={18}
        fill="black"
        align="center"
        width={rectWidth}
        offsetX={rectOffsetX}
        offsetY={rectOffsetY - 40}
      />
    </Group>
  );
};

const CentralServiceProvider: React.FC<CentralServiceProviderProps> = ({ shapes, serviceProviders }) => {
  const width = 150;
  const height = 150;
  const x = window.innerWidth / 2 - width / 2;
  const y = window.innerHeight / 2 - height / 2;

  const imeiList = shapes.map((shape) => `IMEI: ${shape.imei}`).join(", \n");
  const serviceProviderList = serviceProviders.map((provider) => provider.name).join(", ");

  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="green"
        cornerRadius={20} // This attribute rounds the corners
      />
      <Text
        x={x}
        y={y + height / 2 - 10}
        width={width}
        align="center"
        text="Centralized Service Provider"
        fontSize={14}
        fill="white" // Text color
      />
      <Text
        x={x}
        y={20} // Position above the centralized service provider
        text={imeiList}
        fontSize={14}
      />

      <Text
        x={x}
        y={y + height + 10} // Position below the centralized service provider
        text={serviceProviderList}
        fontSize={14}
      />
    </Group>
  );
};

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);

  const generateRandomImei = (): string => {
    // This is a simplified and not real-world accurate method of generating a random IMEI for demonstration purposes
    let imei = '';
    for (let i = 0; i < 15; i++) {
      imei += Math.floor(Math.random() * 10).toString();
    }
    return imei;
  };

  const addShape = () => {
    const newShape: Shape = {
      x: 100,
      y: Math.random() * (window.innerHeight - 50),
      id: Math.random().toString(36).substr(2, 9),
      imei: generateRandomImei(), // Generate and assign a random IMEI number
    };
    setShapes((shapes) => [...shapes, newShape]);
  };

  const addServiceProvider = () => {
    const name = prompt("Enter the name of the service provider:");
    if (name) {
      const newProvider: ServiceProvider = {
        x: window.innerWidth - 200, // Example positioning, adjust as needed
        y: Math.random() * (window.innerHeight - 50),
        id: Math.random().toString(36).substr(2, 9),
        name,
      };
      setServiceProviders((providers) => [...providers, newProvider]);
    }
  };

  const handleDragMove = (id: string, x: number, y: number) => {
    setShapes((shapes) =>
      shapes.map((shape) => (shape.id === id ? { ...shape, x, y } : shape))
    );
  };

  const handleServiceProviderDragMove = (id: string, x: number, y: number) => {
    setServiceProviders((providers) =>
      providers.map((provider) =>
        provider.id === id ? { ...provider, x, y } : provider
      )
    );
  };

  return (
    <div className=''>
      <div className='absolute z-10 h-full p-2'>
        <div className='h-full flex flex-col justify-between bg-blue-300 rounded-lg shadow-lg'>
          <div className='p-2'>
            <Button type='primary' onClick={addShape}>+</Button>
          </div>
          <div className='p-2'>
            <Button type='primary' onClick={addServiceProvider}>+</Button>
          </div>
        </div>
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight} className=''>
        <Layer>
          {shapes.map((shape) => (
            <Mobile
              key={shape.id}
              id={shape.id}
              x={shape.x}
              y={shape.y}
              imei={shape.imei}
              onDragMove={handleDragMove}
            />
          ))}
          {serviceProviders.map((provider) => (
            <ServiceProviderComponent
              key={provider.id}
              id={provider.id}
              x={provider.x}
              y={provider.y}
              name={provider.name}
              onDragMove={handleServiceProviderDragMove}
            />
          ))}
          <CentralServiceProvider shapes={shapes} serviceProviders={serviceProviders} />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
