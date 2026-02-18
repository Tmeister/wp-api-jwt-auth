<?php

require_once __DIR__ . '/TestCase.php';

/**
 * Integration tests for upsell usage tracking helpers.
 */
class JwtAuthUpsellIntegrationTest extends TestCase
{
    protected function tearDown(): void
    {
        delete_option('jwt_auth_install_date');
        delete_option('jwt_auth_tokens_created');

        parent::tearDown();
    }

    public function test_track_install_date_backfills_existing_install(): void
    {
        delete_option('jwt_auth_install_date');
        delete_option('jwt_auth_tokens_created');

        jwt_auth_track_install_date();

        $install_date = (int) get_option('jwt_auth_install_date', 0);
        $tokens_created = (int) get_option('jwt_auth_tokens_created', -1);

        $this->assertGreaterThan(0, $install_date);
        $this->assertEquals(0, $tokens_created);
        $this->assertEqualsWithDelta(time() - (8 * DAY_IN_SECONDS), $install_date, 5);
    }

    public function test_should_show_upsell_false_for_new_install(): void
    {
        update_option('jwt_auth_install_date', time());
        update_option('jwt_auth_tokens_created', 0);

        $this->assertFalse(jwt_auth_should_show_upsell());
    }

    public function test_should_show_upsell_true_after_seven_days(): void
    {
        update_option('jwt_auth_install_date', time() - (8 * DAY_IN_SECONDS));
        update_option('jwt_auth_tokens_created', 0);

        $this->assertTrue(jwt_auth_should_show_upsell());
    }

    public function test_should_show_upsell_true_after_twenty_tokens(): void
    {
        update_option('jwt_auth_install_date', time());
        update_option('jwt_auth_tokens_created', 20);

        $this->assertTrue(jwt_auth_should_show_upsell());
    }

    public function test_increment_tokens_created_increases_counter(): void
    {
        update_option('jwt_auth_tokens_created', 0);

        jwt_auth_increment_tokens_created();

        $this->assertSame(1, (int) get_option('jwt_auth_tokens_created', 0));
    }

    public function test_get_upsell_metrics_returns_expected_shape(): void
    {
        update_option('jwt_auth_install_date', time());
        update_option('jwt_auth_tokens_created', 2);

        $metrics = jwt_auth_get_upsell_metrics();

        $this->assertArrayHasKey('shouldShowUpsell', $metrics);
        $this->assertArrayHasKey('daysActive', $metrics);
        $this->assertArrayHasKey('tokensCreated', $metrics);
        $this->assertIsBool($metrics['shouldShowUpsell']);
        $this->assertIsInt($metrics['daysActive']);
        $this->assertIsInt($metrics['tokensCreated']);
    }
}
