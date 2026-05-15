# =============================================================================
# LodgeFlow Backend — PHP 8.3 + Laravel
# Uses the PHP version required by latest stable Laravel (minimum 8.3)
# =============================================================================

FROM php:8.3-cli

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    unzip \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required for Laravel + PostgreSQL + Redis
RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    zip \
    intl \
    pcntl \
    bcmath

# Install Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Default command: run Laravel's built-in dev server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
