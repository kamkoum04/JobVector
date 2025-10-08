# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Create directories
RUN mkdir -p /app/uploads/cvs /app/temp && chown -R spring:spring /app

# Copy JAR
COPY --from=builder /app/target/*.jar app.jar

# Switch to non-root user
USER spring:spring

EXPOSE 8080

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]
