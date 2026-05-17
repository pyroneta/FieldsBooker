package pyroneta.fields.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pyroneta.fields.config.JwtUtil;
import pyroneta.fields.dto.AuthResponse;
import pyroneta.fields.dto.LoginRequest;
import pyroneta.fields.dto.RegisterRequest;
import pyroneta.fields.entity.Client;
import pyroneta.fields.repository.ClientRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (clientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("An account with that email already exists");
        }

        Client client = new Client();
        client.setName(request.getName());
        client.setLastname(request.getLastname());
        client.setEmail(request.getEmail());
        client.setPhoneNumber(request.getPhoneNumber());
        client.setPassword(passwordEncoder.encode(request.getPassword()));
        clientRepository.save(client);

        String token = jwtUtil.generateToken(client.getIdClient(), client.getEmail());
        return new AuthResponse(
                client.getIdClient(),
                client.getName(),
                client.getLastname(),
                client.getEmail(),
                client.getPhoneNumber(),
                token
        );
    }

    public AuthResponse login(LoginRequest request) {
        Client client = clientRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), client.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(client.getIdClient(), client.getEmail());
        return new AuthResponse(
                client.getIdClient(),
                client.getName(),
                client.getLastname(),
                client.getEmail(),
                client.getPhoneNumber(),
                token
        );
    }
}