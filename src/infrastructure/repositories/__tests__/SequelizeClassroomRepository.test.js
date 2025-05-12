// src/infrastructure/repositories/__tests__/SequelizeClassroomRepository.test.js

import { SequelizeClassroomRepository } from '../SequelizeClassroomRepository.js';
import { Classroom } from '../../../domain/entities/Classroom.js';
import { ClassroomType } from '../../../domain/entities/ClassroomType.js';
import { ClassroomFeature } from '../../../domain/entities/ClassroomFeatures.js';

//  1. Mocks de los modelos de Sequelize
const mockClassroomModel = {
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockClassroomTypeModel = {}; //  No se usa directamente en estas pruebas, pero se necesita en el constructor

const mockFeatureModel = {}; //  Similar a ClassroomTypeModel

// 2.  Función auxiliar para crear instancias de Classroom
const createClassroom = (id, block, classroomNumber, qrCode, capacity, classroomFullName, type, features) => {
  return new Classroom(
    id,
    block,
    classroomNumber,
    qrCode,
    capacity,
    classroomFullName,
    type,
    features
  );
};

describe('SequelizeClassroomRepository', () => {
  let classroomRepository;

  beforeEach(() => {
    // 3.  Crear una nueva instancia del repositorio antes de cada prueba
    classroomRepository = new SequelizeClassroomRepository(
      mockClassroomModel,
      mockClassroomTypeModel,
      mockFeatureModel
    );

    // 4. Limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  //  5. Prueba para el método findById
  it('should find a classroom by id', async () => {
    // 6.  Datos de prueba (simulan un registro de la base de datos)
    const classroomId = 1;
    const mockClassroomRecord = {
      id: classroomId,
      block: 'A',
      classroomNumber: 101,
      qr_code: 'QR123',
      capacity: 30,
      classroomFullName: 'A101',
      type: { id: 1, name: 'Aula regular' },
      features: [{ id: 1, name: 'Proyector' }],
    };
    mockClassroomModel.findByPk.mockResolvedValue(mockClassroomRecord);

    //  7. Ejecutar el método a probar
    const classroom = await classroomRepository.findById(classroomId);

    // 8.  Verificaciones (asegurarse de que el resultado es el esperado)
    expect(mockClassroomModel.findByPk).toHaveBeenCalledWith(classroomId, expect.anything());
    expect(classroom).toEqual(
      createClassroom(
        mockClassroomRecord.id,
        mockClassroomRecord.block,
        mockClassroomRecord.classroomNumber,
        mockClassroomRecord.qr_code,
        mockClassroomRecord.capacity,
        mockClassroomRecord.classroomFullName,
        new ClassroomType(mockClassroomRecord.type.id, mockClassroomRecord.type.name),
        [new ClassroomFeature(mockClassroomRecord.features[0].id, mockClassroomRecord.features[0].name)]
      )
    );
  });

  // 9.  Prueba para el método create
  it('should create a classroom', async () => {
    const newClassroom = createClassroom(
      null, //  Sin ID para la creación
      'B',
      202,
      'QR456',
      25,
      'B202',
      new ClassroomType(2, 'Aula de informática'),
      [new ClassroomFeature(2, 'Ordenadores')]
    );
    const mockCreatedClassroomRecord = {
      id: 2, // Simulamos que la base de datos asigna el ID 2
      block: newClassroom.block,
      classroomNumber: newClassroom.classroomNumber,
      qr_code: newClassroom.qr_code,
      capacity: newClassroom.capacity,
      classroomFullName: newClassroom.classroomFullName,
      typeId: newClassroom.type.id,
      setFeatures: jest.fn(), // Mock para setFeatures
    };
    mockClassroomModel.create.mockResolvedValue(mockCreatedClassroomRecord);
    mockClassroomModel.findByPk.mockResolvedValue({
      ...mockCreatedClassroomRecord,
      type: newClassroom.type,
      features: newClassroom.features,
    });

    const createdClassroom = await classroomRepository.create(newClassroom);

    expect(mockClassroomModel.create).toHaveBeenCalledWith({
      block: newClassroom.block,
      classroomNumber: newClassroom.classroomNumber,
      qr_code: newClassroom.qr_code,
      capacity: newClassroom.capacity,
      classroomFullName: newClassroom.classroomFullName,
      typeId: newClassroom.type.id,
    });
    expect(mockCreatedClassroomRecord.setFeatures).toHaveBeenCalledWith([2]);
    expect(classroomRepository.findById).toHaveBeenCalledWith(2);
    expect(createdClassroom.id).toBe(2);
    expect(createdClassroom.block).toBe(newClassroom.block);
    //  Verifica otros campos si es necesario
  });

  // 10.  Prueba para el método update
  it('should update a classroom', async () => {
    const classroomToUpdate = createClassroom(
      3,
      'C',
      303,
      'QR789',
      20,
      'C303',
      new ClassroomType(1, 'Aula regular'),
      []
    );
    const mockUpdatedClassroomRecord = {
      id: classroomToUpdate.id,
      block: classroomToUpdate.block,
      classroomNumber: classroomToUpdate.classroomNumber,
      qr_code: classroomToUpdate.qr_code,
      capacity: classroomToUpdate.capacity,
      classroomFullName: classroomToUpdate.classroomFullName,
      typeId: classroomToUpdate.type.id,
      setFeatures: jest.fn(),
    };
    mockClassroomModel.update.mockResolvedValue([1]); //  Simula que la actualización afectó a 1 registro
    mockClassroomModel.findByPk.mockResolvedValue({
      ...mockUpdatedClassroomRecord,
      type: classroomToUpdate.type,
      features: [],
    });

    const updatedClassroom = await classroomRepository.update(classroomToUpdate);

    expect(mockClassroomModel.update).toHaveBeenCalledWith(
      {
        id: classroomToUpdate.id,
        block: classroomToUpdate.block,
        classroomNumber: classroomToUpdate.classroomNumber,
        qr_code: classroomToUpdate.qr_code,
        capacity: classroomToUpdate.capacity,
        classroomFullName: classroomToUpdate.classroomFullName,
        typeId: classroomToUpdate.type.id,
      },
      { where: { id: classroomToUpdate.id } }
    );
    expect(mockUpdatedClassroomRecord.setFeatures).toHaveBeenCalledWith([]);
    expect(classroomRepository.findById).toHaveBeenCalledWith(3);
    expect(updatedClassroom).toEqual(
      createClassroom(
        mockUpdatedClassroomRecord.id,
        mockUpdatedClassroomRecord.block,
        mockUpdatedClassroomRecord.classroomNumber,
        mockUpdatedClassroomRecord.qr_code,
        mockUpdatedClassroomRecord.capacity,
        mockUpdatedClassroomRecord.classroomFullName,
        new ClassroomType(mockUpdatedClassroomRecord.type.id, 'Aula regular'),
        []
      )
    );
  });

  // 11.  Prueba para el método delete
  it('should delete a classroom', async () => {
    const classroomIdToDelete = 4;
    mockClassroomModel.destroy.mockResolvedValue(1); //  Simula que se eliminó 1 registro

    await classroomRepository.delete(classroomIdToDelete);

    expect(mockClassroomModel.destroy).toHaveBeenCalledWith({ where: { id: classroomIdToDelete } });
  });

  //  12. Prueba para el método findAll
  it('should find all classrooms', async () => {
    const mockClassroomRecords = [
      {
        id: 1,
        block: 'A',
        classroomNumber: 101,
        qr_code: 'QR123',
        capacity: 30,
        classroomFullName: 'A101',
        type: { id: 1, name: 'Aula regular' },
        features: [{ id: 1, name: 'Proyector' }],
      },
      {
        id: 2,
        block: 'B',
        classroomNumber: 202,
        qr_code: 'QR456',
        capacity: 25,
        classroomFullName: 'B202',
        type: { id: 2, name: 'Aula de informática' },
        features: [{ id: 2, name: 'Ordenadores' }],
      },
    ];
    mockClassroomModel.findAll.mockResolvedValue(mockClassroomRecords);

    const classrooms = await classroomRepository.findAll();

    expect(mockClassroomModel.findAll).toHaveBeenCalledWith({
      include: [
        { model: mockClassroomTypeModel, as: 'type' },
        { model: mockFeatureModel, as: 'features', through: { attributes: [] } },
      ],
    });
    expect(classrooms).toEqual(
      mockClassroomRecords.map((record) =>
        createClassroom(
          record.id,
          record.block,
          record.classroomNumber,
          record.qr_code,
          record.capacity,
          record.classroomFullName,
          new ClassroomType(record.type.id, record.type.name),
          record.features.map((feature) => new ClassroomFeature(feature.id, feature.name))
        )
      )
    );
  });

  // 13. Prueba para el método findByBlockAndNumber
  it('should find a classroom by block and number', async () => {
    const block = 'A';
    const classroomNumber = 101;
    const mockClassroomRecord = {
      id: 1,
      block: block,
      classroomNumber: classroomNumber,
      qr_code: 'QR123',
      capacity: 30,
      classroomFullName: 'A101',
      type: { id: 1, name: 'Aula regular' },
      features: [{ id: 1, name: 'Proyector' }],
    };
    mockClassroomModel.findOne.mockResolvedValue(mockClassroomRecord);

    const classroom = await classroomRepository.findByBlockAndNumber(block, classroomNumber);

    expect(mockClassroomModel.findOne).toHaveBeenCalledWith({
      where: { block, classroomNumber },
      include: [
        { model: mockClassroomTypeModel, as: 'type' },
        { model: mockFeatureModel, as: 'features', through: { attributes: [] } },
      ],
    });
    expect(classroom).toEqual(
      createClassroom(
        mockClassroomRecord.id,
        mockClassroomRecord.block,
        mockClassroomRecord.classroomNumber,
        mockClassroomRecord.qr_code,
        mockClassroomRecord.capacity,
        mockClassroomRecord.classroomFullName,
        new ClassroomType(mockClassroomRecord.type.id, mockClassroomRecord.type.name),
        [new ClassroomFeature(mockClassroomRecord.features[0].id, mockClassroomRecord.features[0].name)]
      )
    );
  });
});
