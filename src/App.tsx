/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, Modal, Input, Select } from 'antd';
import { Stage, Layer, Rect, Line, Group, Text, Image } from 'react-konva';
import useImage from 'use-image';
import Phone from "./assets/images/phone.png"

const { Option } = Select;

interface IDevice {
  x: number;
  y: number;
  id: string;
  imei: string;
  profile: string | null;
  serviceProvider: string | null;
}

interface IProvider {
  x: number;
  y: number;
  id: string;
  name: string;
}

interface IProviderProps {
  x: number;
  y: number;
  id: string;
  name: string;
  onDragMove: (id: string, x: number, y: number) => void;
}


const Mobile: React.FC<IDevice & { onDragMove: (id: string, x: number, y: number) => void }> = ({ x, y, id, imei, profile, onDragMove }) => {
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
      <Text
        text={"Profile: " + profile}
        fontSize={12}
        fill="black"
        x={-15}
        y={100 + 5}
      />
    </Group>
  );
};


const ServiceProviderComponent: React.FC<IProviderProps> = ({ x, y, id, name, onDragMove }) => {
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

const CentralServiceProvider: React.FC = () => {
  const width = 150;
  const height = 150;
  const x = window.innerWidth / 2 - width / 2;
  const y = window.innerHeight / 2 - height / 2;

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
    </Group>
  );
};

const App: React.FC = () => {
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [serviceProviders, setServiceProviders] = useState<IProvider[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedProfileForAssignment, setSelectedProfileForAssignment] = useState<string | null>(null);
  const [selectedServiceProvider, setSelectedServiceProvider] = useState<string | null>(null);

  const generateRandomImei = (): string => {
    // This is a simplified and not real-world accurate method of generating a random IMEI for demonstration purposes
    let imei = '';
    for (let i = 0; i < 15; i++) {
      imei += Math.floor(Math.random() * 10).toString();
    }
    return imei;
  };

  const addShape = () => {
    const newShape: IDevice = {
      x: 100,
      y: Math.random() * (window.innerHeight - 50),
      id: Math.random().toString(36).substr(2, 9),
      imei: generateRandomImei(),
      profile: null,
      serviceProvider: null
    };
    setDevices((shapes) => [...shapes, newShape]);
  };

  const addServiceProvider = () => {
    const name = prompt("Enter the name of the service provider:");
    if (name) {
      const newProvider: IProvider = {
        x: window.innerWidth - 200, // Example positioning, adjust as needed
        y: Math.random() * (window.innerHeight - 50),
        id: Math.random().toString(36).substr(2, 9),
        name,
      };
      setServiceProviders((providers) => [...providers, newProvider]);
    }
  };

  const handleDragMove = (id: string, x: number, y: number) => {
    setDevices((shapes) =>
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

  const showModal = (deviceId: any) => {
    setCurrentDeviceId(deviceId);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    const updatedDevices = devices.map((device) => {
      if (device.id === currentDeviceId) {
        return { ...device, profile: profileName };
      }
      return device;
    });
    setDevices(updatedDevices);
    setIsModalVisible(false);
    setProfileName('');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setProfileName('');
  };

  const addProfile = () => {
    const newProfile = { id: Math.random().toString(36).substr(2, 9), name: profileName };
    setProfiles((prevProfiles) => [...prevProfiles, newProfile]);
    // Optionally close the modal or clear the input field here
  };

  const handleAssignDevices = () => {
    if (!selectedProfileForAssignment || !selectedServiceProvider) {
      // Optionally show an error message or simply return
      console.error("Both a profile and a service provider must be selected.");
      return;
    }

    const updatedDevices = devices.map((device) => {
      if (device.profile === selectedProfileForAssignment) {
        return { ...device, serviceProvider: selectedServiceProvider };
      }
      return device;
    });

    setDevices(updatedDevices);
    setIsAssignModalVisible(false);
    setSelectedProfileForAssignment(null);
    setSelectedServiceProvider(null);
  };

  return (
    <div className=''>
      <Modal title="Device Profile" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Select
          style={{ width: '100%', marginBottom: 8 }}
          placeholder="Select a profile"
          onChange={(value) => setProfileName(value)}
          value={profileName}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                <Input style={{ flex: 'auto' }} value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                <Button type="link" onClick={addProfile}>
                  Add
                </Button>
              </div>
            </>
          )}
        >
          {profiles.map((profile) => (
            <Option key={profile.id} value={profile.name}>{profile.name}</Option>
          ))}
        </Select>
      </Modal>
      <Modal
        title="Assign Devices to Service Provider"
        open={isAssignModalVisible}
        onOk={handleAssignDevices}
        onCancel={() => setIsAssignModalVisible(false)}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a service provider"
          onChange={(value) => setSelectedServiceProvider(value)}
          value={selectedServiceProvider}
        >
          {serviceProviders.map((provider) => (
            <Option key={provider.id} value={provider.id}>{provider.name}</Option>
          ))}
        </Select>
      </Modal>

      <div className='absolute z-10 h-full p-2'>
        <div className='h-full flex flex-col justify-between bg-blue-300 rounded-lg shadow-lg'>
          <div className='p-2'>
            <Button type='primary' onClick={addShape}>+ D</Button>
          </div>
          <div className='p-2'>
            <Button type='primary' onClick={addServiceProvider}>+ P</Button>
          </div>
        </div>
      </div>
      <div className='right-0 absolute z-10 h-full p-2'>
        <div className='h-full flex flex-col bg-blue-300 rounded-lg shadow-lg'>
          {profiles.map((profile) => (
            <div className='p-1'>
              <Button type='primary' key={profile.id} onClick={() => {
                setSelectedProfileForAssignment(profile.name);
                setIsAssignModalVisible(true);
              }}>{profile.name}</Button>
            </div>
          ))}
        </div>
      </div>
      <div className='left-20 absolute z-10 p-2'>
        <div className='h-full flex rounded-lg shadow-lg'>
          {devices.map((device: IDevice) => {
            return (
              <div className='p-1'>
                <Button type='primary' onClick={() => showModal(device.id)}>{device.imei + " : " + device?.profile + " : " + device?.serviceProvider}</Button>
              </div>
            )
          })}
        </div>
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight} className=''>
        <Layer>
          {devices.map((shape) => (
            <Mobile
              key={shape.id}
              id={shape.id}
              x={shape.x}
              y={shape.y}
              imei={shape.imei}
              onDragMove={handleDragMove}
              serviceProvider={shape.serviceProvider}
              profile={shape.profile}
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
          <CentralServiceProvider />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
