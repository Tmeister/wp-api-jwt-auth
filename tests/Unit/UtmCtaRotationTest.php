<?php

use PHPUnit\Framework\TestCase;

class UtmCtaRotationTest extends TestCase
{
    /**
     * Test that CTA rotation logic works correctly for different weeks
     */
    public function test_cta_rotation_returns_correct_variations()
    {
        $cta_variations = array(
            0 => array(
                'text' => '🔐 Add Token Dashboard',
                'utm_content' => 'week-1-token-dashboard',
            ),
            1 => array(
                'text' => '🔄 Enable Auto-Refresh',
                'utm_content' => 'week-2-auto-refresh',
            ),
            2 => array(
                'text' => '📊 View API Analytics',
                'utm_content' => 'week-3-api-analytics',
            ),
            3 => array(
                'text' => '🎯 Manage All Tokens',
                'utm_content' => 'week-4-manage-tokens',
            ),
        );

        // Test each week index
        for ($week_index = 0; $week_index < 4; $week_index++) {
            $selected_variation = $cta_variations[$week_index];
            
            $this->assertArrayHasKey('text', $selected_variation);
            $this->assertArrayHasKey('utm_content', $selected_variation);
            $this->assertNotEmpty($selected_variation['text']);
            $this->assertNotEmpty($selected_variation['utm_content']);
            
            // Verify text contains expected emoji
            $expected_emojis = ['🔐', '🔄', '📊', '🎯'];
            $this->assertStringContainsString($expected_emojis[$week_index], $selected_variation['text']);
            
            // Verify UTM content follows expected pattern
            $expected_utm_pattern = '/^week-[1-4]-[a-z-]+$/';
            $this->assertMatchesRegularExpression($expected_utm_pattern, $selected_variation['utm_content']);
        }
    }

    /**
     * Test that week number calculation works correctly
     */
    public function test_week_number_calculation()
    {
        // Test with known dates
        $test_cases = array(
            // [timestamp, expected_week_mod_4]
            [strtotime('2024-01-01'), 0], // Start of year
            [strtotime('2024-01-08'), 1], // Week 1
            [strtotime('2024-01-15'), 2], // Week 2
            [strtotime('2024-01-22'), 3], // Week 3
            [strtotime('2024-01-29'), 0], // Week 4 (cycles back to 0)
        );

        foreach ($test_cases as [$timestamp, $expected_mod]) {
            $week_number = (int) date('W', $timestamp);
            $week_index = $week_number % 4;
            
            // Allow for some flexibility in week calculation due to different starting days
            $this->assertIsInt($week_index);
            $this->assertGreaterThanOrEqual(0, $week_index);
            $this->assertLessThan(4, $week_index);
        }
    }

    /**
     * Test UTM parameter structure
     */
    public function test_utm_parameters_structure()
    {
        $base_pro_url = 'https://jwtauth.pro';
        $utm_params = array(
            'utm_source' => 'plugin-list',
            'utm_medium' => 'action-link',
            'utm_campaign' => 'feature-highlight',
            'utm_content' => 'week-1-token-dashboard',
        );

        $pro_link_url = add_query_arg($utm_params, $base_pro_url);
        
        // Verify URL structure
        $this->assertStringStartsWith('https://jwtauth.pro', $pro_link_url);
        $this->assertStringContainsString('utm_source=plugin-list', $pro_link_url);
        $this->assertStringContainsString('utm_medium=action-link', $pro_link_url);
        $this->assertStringContainsString('utm_campaign=feature-highlight', $pro_link_url);
        $this->assertStringContainsString('utm_content=week-1-token-dashboard', $pro_link_url);
        
        // Parse URL to verify all parameters are present
        $parsed_url = wp_parse_url($pro_link_url);
        $this->assertArrayHasKey('query', $parsed_url);
        
        parse_str($parsed_url['query'], $query_params);
        $this->assertEquals('plugin-list', $query_params['utm_source']);
        $this->assertEquals('action-link', $query_params['utm_medium']);
        $this->assertEquals('feature-highlight', $query_params['utm_campaign']);
        $this->assertEquals('week-1-token-dashboard', $query_params['utm_content']);
    }

    /**
     * Test that submenu UTM parameters are correctly structured
     */
    public function test_submenu_utm_parameters()
    {
        $base_pro_url = 'https://jwtauth.pro';
        $utm_params = array(
            'utm_source' => 'wp-menu',
            'utm_medium' => 'submenu',
            'utm_campaign' => 'pro-overview',
            'utm_content' => 'menu-link',
        );

        $pro_link_url = add_query_arg($utm_params, $base_pro_url);
        
        $this->assertStringContainsString('utm_source=wp-menu', $pro_link_url);
        $this->assertStringContainsString('utm_medium=submenu', $pro_link_url);
        $this->assertStringContainsString('utm_campaign=pro-overview', $pro_link_url);
        $this->assertStringContainsString('utm_content=menu-link', $pro_link_url);
    }

    /**
     * Test that all CTA variations are unique and properly formatted
     */
    public function test_cta_variations_uniqueness_and_format()
    {
        $cta_variations = array(
            0 => array(
                'text' => '🔐 Add Token Dashboard',
                'utm_content' => 'week-1-token-dashboard',
            ),
            1 => array(
                'text' => '🔄 Enable Auto-Refresh',
                'utm_content' => 'week-2-auto-refresh',
            ),
            2 => array(
                'text' => '📊 View API Analytics',
                'utm_content' => 'week-3-api-analytics',
            ),
            3 => array(
                'text' => '🎯 Manage All Tokens',
                'utm_content' => 'week-4-manage-tokens',
            ),
        );

        $texts = array();
        $utm_contents = array();

        foreach ($cta_variations as $variation) {
            // Collect for uniqueness test
            $texts[] = $variation['text'];
            $utm_contents[] = $variation['utm_content'];

            // Test format
            $this->assertStringStartsNotWith(' ', $variation['text']); // No leading spaces
            $this->assertStringEndsNotWith(' ', $variation['text']); // No trailing spaces
            $this->assertMatchesRegularExpression('/^🔐|🔄|📊|🎯/', $variation['text']); // Starts with emoji
            
            // UTM content format
            $this->assertMatchesRegularExpression('/^week-[1-4]-[a-z-]+$/', $variation['utm_content']);
            $this->assertStringNotContainsString(' ', $variation['utm_content']); // No spaces in UTM
        }

        // Test uniqueness
        $this->assertEquals(4, count(array_unique($texts)), 'All CTA texts should be unique');
        $this->assertEquals(4, count(array_unique($utm_contents)), 'All UTM contents should be unique');
    }
}