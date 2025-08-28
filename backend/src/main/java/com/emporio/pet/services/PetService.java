package com.emporio.pet.services;

import com.emporio.pet.dto.PetDTO;
import com.emporio.pet.dto.PetInsertDTO;
import com.emporio.pet.dto.PetUpdateDTO;
import com.emporio.pet.entities.Breed;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Pet;
import com.emporio.pet.entities.User;
import com.emporio.pet.repositories.PetRepository;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final AuthService authService;
    private final BreedService breedService;

    public PetService(PetRepository petRepository, AuthService authService, BreedService breedService) {
        this.petRepository = petRepository;
        this.authService = authService;
        this.breedService = breedService;
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. LÓGICA DE NEGÓCIO: A versão original não associava um dono (Customer) nem uma raça (Breed),
     * o que causaria um erro de integridade no banco de dados. Agora, o dono é obtido
     * pelo usuário autenticado e a raça é buscada via BreedService.
     * 2. SEGURANÇA: Foi adicionada uma regra que garante que apenas usuários do tipo 'Customer'
     * possam cadastrar novos pets, protegendo a lógica do negócio.
     */
    @Transactional
    public PetDTO createPet(PetInsertDTO dto) {
        User user = authService.authenticated();

        if (!(user instanceof Customer owner)) {
            throw new ForbiddenException("Acesso negado. Apenas clientes podem cadastrar pets.");
        }

        Breed breed = breedService.findEntityById(dto.getBreedId());

        Pet pet = new Pet();
        pet.setName(dto.getName());
        pet.setBirthDate(dto.getBirthDate());
        pet.setNotes(dto.getNotes());
        pet.setOwner(owner);
        pet.setBreed(breed);

        pet = petRepository.save(pet);
        return new PetDTO(pet);
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. FALHA DE SEGURANÇA: A versão original recebia um 'customerId' como parâmetro,
     * permitindo que qualquer usuário visse os pets de outro cliente apenas ao adivinhar o ID.
     * 2. LÓGICA CORRIGIDA: O método agora não recebe parâmetros. Ele busca automaticamente
     * o usuário logado e retorna apenas os pets daquele usuário, fechando a brecha de segurança.
     */
    @Transactional(readOnly = true)
    public List<PetDTO> findMyPets() {
        User user = authService.authenticated();

        if (!(user instanceof Customer customer)) {
            return List.of();
        }

        List<Pet> pets = petRepository.findByOwnerId(customer.getId());
        return pets.stream().map(PetDTO::new).collect(Collectors.toList());
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. FALHA DE SEGURANÇA: O método original não possuía verificação de permissão.
     * Qualquer usuário autenticado poderia buscar qualquer pet pelo ID.
     * 2. LÓGICA CORRIGIDA: Adicionada uma verificação que garante que o usuário logado
     * seja o dono do pet ou um administrador (ROLE_ADMIN).
     */
    @Transactional(readOnly = true)
    public PetDTO findById(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado com o ID: " + id));

        if (!authService.isSelfOrAdmin(pet.getOwner().getId())) {
            throw new ForbiddenException("Acesso negado.");
        }
        return new PetDTO(pet);
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. BUG DE ATUALIZAÇÃO: A lógica original sobrescrevia campos não enviados com 'null'.
     * Se o usuário enviasse apenas as 'notes', o 'name' e a 'birthDate' se tornariam nulos.
     * 2. LÓGICA CORRIGIDA: O método agora verifica se cada campo do DTO é diferente de nulo
     * antes de atualizar a entidade, permitindo atualizações parciais de forma segura.
     * 3. SEGURANÇA: Adicionada a mesma verificação de permissão do 'findById'.
     */
    @Transactional
    public PetDTO update(Long id, PetUpdateDTO dto) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado com o ID: " + id));

        if (!authService.isSelfOrAdmin(pet.getOwner().getId())) {
            throw new ForbiddenException("Acesso negado.");
        }

        if (dto.getName() != null) {
            pet.setName(dto.getName());
        }
        if (dto.getBirthDate() != null) {
            pet.setBirthDate(dto.getBirthDate());
        }
        if (dto.getNotes() != null) {
            pet.setNotes(dto.getNotes());
        }
        if (dto.getBreedId() != null) {
            Breed breed = breedService.findEntityById(dto.getBreedId());
            pet.setBreed(breed);
        }

        Pet updatedPet = petRepository.save(pet);
        return new PetDTO(updatedPet);
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. MUDANÇA DE ESTRATÉGIA: O método original realizava um 'hard delete', apagando
     * permanentemente o registro do banco, o que poderia levar à perda de histórico.
     * 2. LÓGICA CORRIGIDA: Implementado o 'Soft Delete'. Em vez de deletar, o método agora
     * apenas marca o pet como inativo (`ativo = false`), preservando a integridade
     * e o histórico dos dados. A verificação de segurança também foi mantida.
     */
    @Transactional
    public void delete(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet não encontrado com o ID: " + id));

        if (!authService.isSelfOrAdmin(pet.getOwner().getId())) {
            throw new ForbiddenException("Acesso negado.");
        }

        pet.setAtivo(false);
        petRepository.save(pet);
    }
}