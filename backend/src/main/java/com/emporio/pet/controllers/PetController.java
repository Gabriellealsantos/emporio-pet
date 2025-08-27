package com.emporio.pet.controllers;

import com.emporio.pet.dto.PetDTO;
import com.emporio.pet.dto.PetInsertDTO;
import com.emporio.pet.dto.PetUpdateDTO;
import com.emporio.pet.services.PetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. PADRÃO REST: O endpoint original era "/cadastrar". Foi corrigido para a raiz do recurso ("/"),
     * utilizando o verbo HTTP POST, que é o padrão para criação (POST /pets).
     * 2. DTO ESPECÍFICO: Trocado o genérico PetDTO pelo PetInsertDTO e adicionada a anotação @Valid
     * para garantir que as regras de validação do DTO sejam aplicadas.
     * 3. RESPOSTA HTTP: A resposta agora retorna o status 201 Created, que é semanticamente
     * correto para criação, e inclui o header 'Location' com a URL do novo pet criado.
     */
    @PostMapping
    public ResponseEntity<PetDTO> create(@Valid @RequestBody PetInsertDTO dto) {
        PetDTO newDto = petService.createPet(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. PADRÃO REST E SEGURANÇA: O endpoint original era "/cliente/{customerId}", uma grave falha
     * de segurança. Foi corrigido para GET /pets, que agora chama o método seguro do service
     * para listar apenas os pets do usuário autenticado.
     */
    @GetMapping
    public ResponseEntity<List<PetDTO>> findMyPets() {
        List<PetDTO> list = petService.findMyPets();
        return ResponseEntity.ok(list);
    }

    /**
     * MELHORIAS APLICADAS:
     * 1. CONSISTÊNCIA: Este endpoint já estava correto, mas foi padronizado para retornar
     * ResponseEntity, assim como os outros, para manter a consistência do controller.
     */
    @GetMapping(value = "/{id}")
    public ResponseEntity<PetDTO> findById(@PathVariable Long id) {
        PetDTO dto = petService.findById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. PADRÃO REST: O verbo original era POST e o endpoint "/editar/{id}". Foi corrigido
     * para o verbo PUT, que é o padrão para atualização de um recurso (PUT /pets/{id}).
     * 2. DTO ESPECÍFICO: Trocado o PetDTO pelo PetUpdateDTO com @Valid, permitindo
     * atualizações parciais de forma segura e validada.
     */
    @PutMapping(value = "/{id}")
    public ResponseEntity<PetDTO> update(@PathVariable Long id, @Valid @RequestBody PetUpdateDTO dto) {
        PetDTO updatedDto = petService.update(id, dto);
        return ResponseEntity.ok(updatedDto);
    }

    /**
     * CORREÇÕES APLICADAS:
     * 1. PADRÃO REST: O verbo original era POST e o endpoint "/remover/{id}". Corrigido
     * para o verbo DELETE, padrão para exclusão (DELETE /pets/{id}).
     * 2. RESPOSTA HTTP: A resposta agora retorna o status 204 No Content, que é o padrão
     * para uma operação de exclusão bem-sucedida, informando ao cliente que
     * a requisição foi processada, mas não há conteúdo para retornar.
     */
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();
    }
}