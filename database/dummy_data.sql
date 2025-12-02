USE bus_fms;

-- Insert Routes
INSERT INTO Routes (RouteName, StartPoint, EndPoint) VALUES 
('Route 1', 'Central Station', 'North Campus'),
('Route 2', 'Downtown', 'South Campus'),
('Route 3', 'West End', 'East Campus'),
('Route 4', 'Airport', 'City Center');

-- Insert Buses
INSERT INTO Buses (BusNumber, Capacity, RouteID) VALUES 
('KA-19-A-1234', 50, 1),
('KA-19-B-5678', 40, 2),
('KA-19-C-9012', 60, 3),
('KA-19-D-3456', 45, 1);

-- Insert Drivers
INSERT INTO Drivers (Name, LicenseNumber, Phone) VALUES 
('Ramesh Kumar', 'DL-KA-2020001', '9876543210'),
('Suresh Shetty', 'DL-KA-2019002', '9876543211'),
('Mahesh Rao', 'DL-KA-2021003', '9876543212'),
('Ganesh Poojary', 'DL-KA-2018004', '9876543213');

-- Insert Students
INSERT INTO Students (Name, Grade, BusRouteId, BoardingPoint) VALUES 
('Aarav Sharma', '10', 1, 'Central Station'),
('Vivaan Gupta', '12', 2, 'Downtown'),
('Aditya Verma', '9', 1, 'City Mall Stop'),
('Vihaan Singh', '11', 3, 'West End'),
('Arjun Reddy', '10', 2, 'Market Square');

-- Insert Maintenance Logs
INSERT INTO MaintenanceLogs (BusID, Description, Date) VALUES 
(1, 'Oil Change and Filter Replacement', '2025-01-15'),
(2, 'Brake Inspection', '2025-02-01'),
(3, 'Tire Rotation', '2025-02-10');

-- Insert Incidents
INSERT INTO Incidents (BusID, Description, Date) VALUES 
(1, 'Minor scratch on left bumper', '2025-01-20'),
(2, 'Delayed due to heavy traffic', '2025-02-05'),
(4, 'Flat tire during morning route', '2025-02-15');
