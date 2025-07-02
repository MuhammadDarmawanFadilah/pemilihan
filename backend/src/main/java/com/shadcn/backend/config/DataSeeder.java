package com.shadcn.backend.config;

import com.shadcn.backend.model.Payment;
import com.shadcn.backend.model.User;
import com.shadcn.backend.model.Role;
import com.shadcn.backend.repository.PaymentRepository;
import com.shadcn.backend.repository.UserRepository;
import com.shadcn.backend.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.HashSet;

@Component
public class DataSeeder implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);
      @Autowired
    private UserRepository userRepository;
      @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AppProperties appProperties;
      @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data seeding process...");
        
        if (!appProperties.getSampleData().isEnabled()) {
            logger.info("Sample data seeding is disabled in configuration");
            return;
        }
        
        // Seed roles first
        if (roleRepository.count() == 0) {
            logger.info("No roles found, seeding roles...");
            seedRoles();
        } else {
            logger.info("Roles already exist, skipping role seeding. Count: {}", roleRepository.count());
        }
          if (userRepository.count() == 0) {
            logger.info("No users found, seeding users...");
            seedUsers();
        } else {
            logger.info("Users already exist, skipping user seeding. Count: {}", userRepository.count());
            // Fix existing users that might not have roles
            fixUsersWithoutRoles();
        }
        
        if (paymentRepository.count() == 0) {
            logger.info("No payments found, seeding payments...");
            seedPayments();
        } else {
            logger.info("Payments already exist, skipping payment seeding. Count: {}", paymentRepository.count());
        }
          logger.info("Data seeding process completed.");
    }
    
    private String generatePaymentId(int index) {
        return appProperties.getPayment().getPrefix() + String.format("%08d", index);
    }
      private void seedUsers() {
        // Create users using default constructor and setters
        User user1 = new User();
        user1.setUsername("john_doe");
        user1.setEmail("john@example.com");
        user1.setFullName("John Doe");
        user1.setPassword("password123");
        user1.setPhoneNumber("+1234567890");
        user1.setAvatarUrl("https://github.com/shadcn.png");
        
        User user2 = new User();
        user2.setUsername("jane_smith");
        user2.setEmail("jane@example.com");
        user2.setFullName("Jane Smith");
        user2.setPassword("password123");
        user2.setPhoneNumber("+1234567891");
        user2.setAvatarUrl("https://github.com/vercel.png");
        
        User user3 = new User();
        user3.setUsername("mike_johnson");
        user3.setEmail("mike@example.com");
        user3.setFullName("Mike Johnson");
        user3.setPassword("password123");
        user3.setPhoneNumber("+1234567892");
        user3.setStatus(User.UserStatus.INACTIVE);
        
        User user4 = new User();
        user4.setUsername("sarah_wilson");
        user4.setEmail("sarah@example.com");
        user4.setFullName("Sarah Wilson");
        user4.setPassword("password123");
        user4.setPhoneNumber("+1234567893");
        user4.setAvatarUrl("https://github.com/github.png");
        
        User user5 = new User();
        user5.setUsername("david_brown");
        user5.setEmail("david@example.com");
        user5.setFullName("David Brown");
        user5.setPassword("password123");
        user5.setPhoneNumber("+1234567894");
          List<User> users = Arrays.asList(user1, user2, user3, user4, user5);
        
        // Set default role and encode passwords for each user
        Role defaultRole = roleRepository.findByRoleName("USER").orElse(null);
        if (defaultRole == null) {
            logger.warn("Default USER role not found, users will be created without roles");
        }
        
        for (User user : users) {
            user.setRole(defaultRole);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        user5.setStatus(User.UserStatus.SUSPENDED);
          userRepository.saveAll(users);
        logger.info("Successfully seeded {} users", users.size());
        
        // Log each user for verification
        for (User user : users) {
            logger.debug("Seeded user: id={}, username={}, email={}", 
                user.getId(), user.getUsername(), user.getEmail());
            }
    }      private void seedRoles() {
        // Create default roles
        Role adminRole = new Role();
        adminRole.setRoleName("ADMIN");
        adminRole.setPermissions(new HashSet<>(Arrays.asList(
            "users.read", "users.write", "users.delete",
            "roles.read", "roles.write", "roles.delete",
            "biografi.read", "biografi.write", "biografi.delete",
            "payments.read", "payments.write", "payments.delete",
            "documents.read", "documents.write", "documents.delete",
            "news.read", "news.write", "news.delete"
        )));
        
        Role userRole = new Role();
        userRole.setRoleName("USER");
        userRole.setPermissions(new HashSet<>(Arrays.asList(
            "biografi.read", "biografi.write",
            "payments.read",
            "documents.read",
            "news.read"
        )));
          Role moderatorRole = new Role();
        moderatorRole.setRoleName("MODERATOR");
        moderatorRole.setPermissions(new HashSet<>(Arrays.asList(
            "users.read", "users.write",
            "biografi.read", "biografi.write",
            "payments.read",
            "documents.read", "documents.write",
            "news.read", "news.write"
        )));
        
        Role alumniRole = new Role();
        alumniRole.setRoleName("ALUMNI");
        alumniRole.setPermissions(new HashSet<>(Arrays.asList(
            "biografi.read", "biografi.write",
            "payments.read",
            "documents.read",
            "news.read"
        )));
        
        List<Role> roles = Arrays.asList(adminRole, userRole, moderatorRole, alumniRole);
        roleRepository.saveAll(roles);
        logger.info("Successfully seeded {} roles", roles.size());
        
        // Log each role for verification
        for (Role role : roles) {
            logger.debug("Seeded role: id={}, name={}, permissions={}", 
                role.getRoleId(), role.getRoleName(), role.getPermissions());
        }
    }
    private void seedPayments() {
        logger.info("Starting payment seeding...");
        List<User> users = userRepository.findAll();
        
        if (users.isEmpty()) {
            logger.warn("No users found for payment seeding, skipping...");
            return;
        }
        
        logger.info("Found {} users for payment seeding", users.size());
        
        List<Payment> payments = Arrays.asList(
            new Payment("PAY-12345678", new BigDecimal("299.99"), Payment.PaymentStatus.SUCCESS, Payment.PaymentMethod.CREDIT_CARD, "Subscription Fee", Payment.PaymentCategory.TUITION, users.get(0)),
            new Payment("PAY-87654321", new BigDecimal("149.50"), Payment.PaymentStatus.SUCCESS, Payment.PaymentMethod.PAYPAL, "Product Purchase", Payment.PaymentCategory.BOOKS, users.get(1)),
            new Payment("PAY-11111111", new BigDecimal("499.00"), Payment.PaymentStatus.PENDING, Payment.PaymentMethod.BANK_TRANSFER, "Service Payment", Payment.PaymentCategory.OTHER, users.get(2)),
            new Payment("PAY-22222222", new BigDecimal("79.99"), Payment.PaymentStatus.FAILED, Payment.PaymentMethod.CREDIT_CARD, "Monthly Subscription", Payment.PaymentCategory.ACCOMMODATION, users.get(3)),
            new Payment("PAY-33333333", new BigDecimal("199.99"), Payment.PaymentStatus.SUCCESS, Payment.PaymentMethod.STRIPE, "One-time Purchase", Payment.PaymentCategory.SUPPLIES, users.get(4)),
            new Payment("PAY-44444444", new BigDecimal("89.99"), Payment.PaymentStatus.REFUNDED, Payment.PaymentMethod.DEBIT_CARD, "Refunded Item", Payment.PaymentCategory.BOOKS, users.get(0)),
            new Payment("PAY-55555555", new BigDecimal("359.99"), Payment.PaymentStatus.SUCCESS, Payment.PaymentMethod.CREDIT_CARD, "Premium Package", Payment.PaymentCategory.TUITION, users.get(1)),
            new Payment("PAY-66666666", new BigDecimal("25.00"), Payment.PaymentStatus.CANCELLED, Payment.PaymentMethod.CASH, "Cancelled Order", Payment.PaymentCategory.MEALS, users.get(2))
        );
        
        // Set transaction IDs for some payments
        payments.get(0).setTransactionId("TXN-001234");
        payments.get(1).setTransactionId("TXN-001235");
        payments.get(4).setTransactionId("TXN-001236");
        payments.get(6).setTransactionId("TXN-001237");
        
        paymentRepository.saveAll(payments);
        logger.info("Successfully seeded {} payments", payments.size());
        
        // Log each payment for verification
        for (Payment payment : payments) {
            logger.debug("Seeded payment: id={}, paymentId={}, amount={}, status={}, user={}", 
                payment.getId(), payment.getPaymentId(), payment.getAmount(), 
                payment.getStatus(), payment.getUser() != null ? payment.getUser().getUsername() : "null");
        }
    }
    private void fixUsersWithoutRoles() {
        logger.info("Checking for users without roles...");
        List<User> usersWithoutRoles = userRepository.findAll().stream()
            .filter(user -> user.getRole() == null)
            .toList();
        
        if (!usersWithoutRoles.isEmpty()) {
            logger.info("Found {} users without roles, assigning default USER role", usersWithoutRoles.size());
            Role defaultRole = roleRepository.findByRoleName("USER").orElse(null);
            
            if (defaultRole != null) {
                for (User user : usersWithoutRoles) {
                    user.setRole(defaultRole);
                    // Also encode password if it's not already encoded
                    if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                        user.setPassword(passwordEncoder.encode(user.getPassword()));
                    }
                }
                userRepository.saveAll(usersWithoutRoles);
                logger.info("Successfully assigned roles to {} users", usersWithoutRoles.size());
            } else {
                logger.error("Default USER role not found! Cannot assign roles to users.");
            }
        } else {
            logger.info("All existing users already have roles assigned");
        }
    }
}
