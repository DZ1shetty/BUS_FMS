-- Clear existing data (optional, but good for resetting if users run this manually)
DELETE FROM Incidents;
DELETE FROM MaintenanceLogs;
DELETE FROM Students;
DELETE FROM Drivers;
DELETE FROM Buses;
DELETE FROM Routes;
DELETE FROM sqlite_sequence WHERE name IN ('Routes', 'Buses', 'Students', 'Drivers', 'MaintenanceLogs', 'Incidents');

-- 1. Routes (20 entries)
INSERT INTO Routes (RouteName, StartPoint, EndPoint) VALUES 
('Route 1', 'Central Station', 'North Campus'),
('Route 2', 'Downtown Plaza', 'South Campus'),
('Route 3', 'West End Mall', 'East Campus'),
('Route 4', 'Airport Road', 'City Center'),
('Route 5', 'Tech Park', 'Housing Board Colony'),
('Route 6', 'Railway Station', 'Medical College'),
('Route 7', 'Suburban Heights', 'University Main Gate'),
('Route 8', 'Greenfield Layout', 'Science Center'),
('Route 9', 'Harbor View', 'Engineering Block'),
('Route 10', 'Old Town Market', 'Sports Complex'),
('Route 11', 'Lakeside Residencies', 'Arts College'),
('Route 12', 'Industrial Estate', 'Management School'),
('Route 13', 'Hilltop Gardens', 'Library Square'),
('Route 14', 'Riverside Drive', 'Auditorium'),
('Route 15', 'Sunset Boulevard', 'Gymkhana'),
('Route 16', 'Metro Terminal', 'Research Park'),
('Route 17', 'Golden Enclave', 'Hostel Block A'),
('Route 18', 'Silver Oaks', 'Hostel Block B'),
('Route 19', 'Crystal Apartments', 'Staff Quarters'),
('Route 20', 'Palm Grove', 'Guest House');

-- 2. Buses (20 entries, linking to Routes 1-20)
INSERT INTO Buses (BusNumber, Capacity, RouteID) VALUES 
('KA-19-A-1001', 50, 1),
('KA-19-B-1002', 40, 2),
('KA-19-C-1003', 60, 3),
('KA-19-D-1004', 45, 4),
('KA-19-E-1005', 55, 5),
('KA-19-F-1006', 50, 6),
('KA-19-G-1007', 42, 7),
('KA-19-H-1008', 48, 8),
('KA-19-I-1009', 60, 9),
('KA-19-J-1010', 35, 10),
('KA-19-K-1011', 50, 11),
('KA-19-L-1012', 40, 12),
('KA-19-M-1013', 55, 13),
('KA-19-N-1014', 60, 14),
('KA-19-O-1015', 45, 15),
('KA-19-P-1016', 50, 16),
('KA-19-Q-1017', 40, 17),
('KA-19-R-1018', 60, 18),
('KA-19-S-1019', 30, 19),
('KA-19-T-1020', 50, 20);

-- 3. Drivers (20 entries)
INSERT INTO Drivers (Name, LicenseNumber, Phone) VALUES 
('Ramesh Kumar', 'DL-KA-2020001', '9876543210'),
('Suresh Shetty', 'DL-KA-2019002', '9876543211'),
('Mahesh Rao', 'DL-KA-2021003', '9876543212'),
('Ganesh Poojary', 'DL-KA-2018004', '9876543213'),
('Vikram Singh', 'DL-KA-2017005', '9876543214'),
('Rahul Dravid', 'DL-KA-2016006', '9876543215'),
('Anil Kumble', 'DL-KA-2015007', '9876543216'),
('Sachin Tendulkar', 'DL-KA-2014008', '9876543217'),
('Virat Kohli', 'DL-KA-2013009', '9876543218'),
('Rohit Sharma', 'DL-KA-2012010', '9876543219'),
('Zaheer Khan', 'DL-KA-2011011', '9876543220'),
('Harbhajan Singh', 'DL-KA-2010012', '9876543221'),
('Yuvraj Singh', 'DL-KA-2009013', '9876543222'),
('Virender Sehwag', 'DL-KA-2008014', '9876543223'),
('Gautam Gambhir', 'DL-KA-2007015', '9876543224'),
('MS Dhoni', 'DL-KA-2006016', '9876543225'),
('Ravindra Jadeja', 'DL-KA-2005017', '9876543226'),
('Jasprit Bumrah', 'DL-KA-2004018', '9876543227'),
('Hardik Pandya', 'DL-KA-2003019', '9876543228'),
('KL Rahul', 'DL-KA-2002020', '9876543229');

-- 4. Students (20 entries, linking to Routes 1-20)
INSERT INTO Students (Name, Grade, BusRouteId, BoardingPoint) VALUES 
('Aarav Sharma', '10', 1, 'Central Station'),
('Vivaan Gupta', '12', 2, 'Downtown Plaza'),
('Aditya Verma', '9', 1, 'City Mall Stop'),
('Vihaan Singh', '11', 3, 'West End Mall'),
('Arjun Reddy', '10', 2, 'Market Square'),
('Sai Kumar', '8', 4, 'Airport Road Stop'),
('Reyansh Iyer', '12', 5, 'Tech Park Gate 1'),
('Mohammed Zaid', '9', 6, 'Railway Station'),
('Ishaan Patel', '11', 7, 'Suburban Heights'),
('Dhruv Mehta', '10', 8, 'Greenfield Main Rd'),
('Kabir Das', '12', 9, 'Harbor View Point'),
('Rohan Nair', '8', 10, 'Old Town Market'),
('Ayaan Khan', '9', 11, 'Lakeside Club'),
('Krishna Menon', '11', 12, 'Industrial Estate'),
('Omkar Joshi', '10', 13, 'Hilltop Gardens'),
('Veer Singh', '12', 14, 'Riverside Drive'),
('Yashwant Rao', '9', 15, 'Sunset Boulevard'),
('Pranav Hegde', '11', 16, 'Metro Terminal'),
('Sarthak Jain', '10', 17, 'Golden Enclave'),
('Tanay Chheda', '8', 18, 'Silver Oaks Main');

-- 5. MaintenanceLogs (20 entries, linking to Buses 1-20)
INSERT INTO MaintenanceLogs (BusID, Description, Date) VALUES 
(1, 'Oil Change and Filter Replacement', '2025-01-15'),
(2, 'Brake Inspection', '2025-02-01'),
(3, 'Tire Rotation', '2025-02-10'),
(4, 'Engine Tuning', '2025-01-20'),
(5, 'Coolant Flush', '2025-02-05'),
(6, 'Battery Check and Replacement', '2025-01-25'),
(7, 'Headlight Bulb Replacement', '2025-02-12'),
(8, 'Wiper Blade Replacement', '2025-01-18'),
(9, 'AC Servicing', '2025-02-08'),
(10, 'Transmission Fluid Check', '2025-01-22'),
(11, 'Suspension Inspection', '2025-02-15'),
(12, 'Exhaust System Repair', '2025-01-30'),
(13, 'Steering Alignment', '2025-02-03'),
(14, 'Fuel Injector Cleaning', '2025-01-28'),
(15, 'Radiator Leak Test', '2025-02-14'),
(16, 'Alternator Belt Replacement', '2025-01-26'),
(17, 'Spark Plug Change', '2025-02-06'),
(18, 'Door Mechanism Lubrication', '2025-01-29'),
(19, 'Seat Upholstery Repair', '2025-02-11'),
(20, 'General Service Checkup', '2025-01-24');

-- 6. Incidents (20 entries)
INSERT INTO Incidents (BusID, Description, Date) VALUES 
(1, 'Minor scratch on left bumper', '2025-01-20'),
(2, 'Delayed due to heavy traffic', '2025-02-05'),
(4, 'Flat tire during morning route', '2025-02-15'),
(5, 'Engine overheating warning', '2025-01-25'),
(3, 'Broken side mirror', '2025-02-08'),
(7, 'Minor collision with bike (no injury)', '2025-01-30'),
(9, 'AC malfunction complained by students', '2025-02-12'),
(11, 'Fuel leakage detected', '2025-01-28'),
(6, 'Late arrival due to road block', '2025-02-02'),
(8, 'Headlight failure at night', '2025-01-22'),
(10, 'Wiper malfunction during rain', '2025-02-14'),
(12, 'Bus breakdown near highway', '2025-01-26'),
(15, 'Seat belt jammed', '2025-02-06'),
(13, 'Horn not working', '2025-02-01'),
(14, 'Emergency door stuck', '2025-01-29'),
(18, 'Speed governor warning', '2025-02-10'),
(16, 'Coolant leak observed', '2025-01-24'),
(19, 'Strange noise from engine', '2025-02-04'),
(17, 'Brake squeaking noise', '2025-01-27'),
(20, 'Indicator light fused', '2025-02-13');
