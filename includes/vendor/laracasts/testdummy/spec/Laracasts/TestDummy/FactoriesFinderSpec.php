<?php

namespace spec\Laracasts\TestDummy;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class FactoriesFinderSpec extends ObjectBehavior
{
	private $stubDir;

	function let()
	{
		$this->stubDir = __DIR__.'/helpers/';

		$this->beConstructedWith($this->stubDir);
	}

	function it_is_initializable()
	{
		$this->shouldHaveType('Laracasts\TestDummy\FactoriesFinder');
	}

	function it_hunts_down_the_fixtures_file_like_a_dog()
	{
		$this->find()->shouldBe([$this->stubDir.'all.php']);
	}

	function it_ignores_non_php_files()
	{
		$notPhpFile = $this->createFile('foo.txt');

		$this->find()->shouldBe([$this->stubDir.'all.php']);

		unlink($notPhpFile);
	}

	function it_ignores_files_without_extension()
	{
		$fileWithoutExtension = $this->createFile('foo');

		$this->find()->shouldBe([$this->stubDir.'all.php']);

		unlink($fileWithoutExtension);
	}

	private function createFile($filename, $dir = null, $content = '')
	{
		if ($dir === null) {
			$dir = $this->stubDir;
		}

		$file = $dir . $filename;

		file_put_contents($file, $content);

		return $file;
	}
}
