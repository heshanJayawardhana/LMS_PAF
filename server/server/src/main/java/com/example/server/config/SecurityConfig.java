package com.example.server.config;

import com.example.server.auth.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.cors(Customizer.withDefaults())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register", "/api/auth/google").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
						.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/facilities/**").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/facilities/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/facilities/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/facilities/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/bookings/**").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/bookings").hasAnyRole("USER", "ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/bookings/*/approve", "/api/bookings/*/reject").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/bookings/*/cancel").hasAnyRole("USER", "ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/bookings/**").hasAnyRole("USER", "ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/bookings/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/tickets/**").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/tickets").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/tickets/*/status").hasAnyRole("ADMIN", "TECHNICIAN")
						.requestMatchers(HttpMethod.POST, "/api/tickets/*/assign").hasAnyRole("ADMIN", "TECHNICIAN")
						.requestMatchers(HttpMethod.POST, "/api/tickets/*/comments").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/notifications/**").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/notifications").authenticated()
						.requestMatchers(HttpMethod.PATCH, "/api/notifications/**").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/notifications/**").authenticated()
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.anyRequest().authenticated()
				)
				.httpBasic(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
